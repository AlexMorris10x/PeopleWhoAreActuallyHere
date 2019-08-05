const jsonwt = require('jsonwebtoken');
const e = require('../error_codes');

exports.entries = (db, rsa_pem_publicKey) => async (req, res) => {
  const invalidations = [];
  const { jwt } = req.query;

  if (typeof jwt !== 'string') {
    invalidations.push(e.missing_parameter('jwt'));
  }

  let decoded_jwt;

  try {
    decoded_jwt = await new Promise((resolve, reject) => {
      jsonwt.verify(jwt, rsa_pem_publicKey, {
        algorithm: 'RS256',
        maxAge: "2 days",
        // clockTolerance: (60 * 60) // 1hr of tolerance w/ 2-day expire.
      }, (error, jwt) => {
        error ? reject(error): resolve(jwt)
      });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      invalidations.push(e.jwt_expired);
    } else {
      invalidations.push(e.jwt_invalid);
    }
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  let entries;

  try {
    entries = await db.entry.getLatest100();
  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }

  // get content for entries
  for (let entry of entries) {
    if (typeof entry.contents === 'undefined') {
      entry.contents = [];
    }

    const markdown = await db.content_markdown.getByEntryID(entry.id);

    entry.contents.push(markdown);
  }

  res.status(200).json({ entries });
};

/*
   Add a new entry.

   Entries can have multiple contents. Content types must be specified as
   a field in each content object. Order matters.

   POST body example: {
     contents: [
       { type: 'markdown', markdown: '...' },
       { type: 'markdown', markdown: '...' },
       ...
     ]
   }
*/
exports.add = (db, rsa_pem_publicKey) => async (req, res) => {
  const invalidations = [];
  const { contents } = req.body;
  const { jwt } = req.query;

  if (typeof jwt !== 'string') {
    invalidations.push(e.missing_parameter('jwt'));
  }

  if (!(contents instanceof Array)) {
    invalidations.push(e.invalid_parameter("contents", "must be an array"));
  } else {
    contents.forEach((content) => {
      if (typeof content.type === 'undefined') {
        invalidations.push(e.invalid_parameter("contents", "content missing `type` field"));
      }

      if (content.type !== 'markdown') {
        invalidations.push(e.invalid_parameter("contents", "invalid `type` field provided"));
      }

      if (typeof content.markdown !== 'string') {
        invalidations.push(e.invalid_parameter("contents", "type `markdown` must have `markdown` field"));
      }
    });
  }

  let decoded_jwt;

  try {
    decoded_jwt = await new Promise((resolve, reject) => {
      jsonwt.verify(jwt, rsa_pem_publicKey, {
        algorithm: 'RS256',
        maxAge: "2 days",
        // clockTolerance: (60 * 60) // 1hr of tolerance w/ 2-day expire.
      }, (error, jwt) => {
        error ? reject(error): resolve(jwt)
      });
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      invalidations.push(e.jwt_expired);
    } else {
      invalidations.push(e.jwt_invalid);
    }
  }

  let token;
  if (decoded_jwt) {
    token = await db.token.getByToken(decoded_jwt.token);

    if (typeof token === 'undefined') {
      invalidations.push(e.not_found("the token was not found---reauthenticate."));
    }
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  try {
    const { lastID: entryID } = await db.entry.add(token.id);

    const contentIDs = [];
    for (let content of contents) {
      const { lastID: contentID } = await db.content_markdown.add(
        entryID, content.markdown
      );

      contentIDs.push(contentID)
    }

    res.status(200).json({});
  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }
};

function get_peristaltic_bottle_pour_duration(liter_pour) {
  // our mesurement of what a shot is. This is a ratio that represents how
  // long it takes to pour a shot with the peristaltic pumps.
  const measurement = {
    liters: 0.044,
    full_bottle_pour_duration: 2000
  };

  // adjust the duration from of measurement to the passed in liters we're pouring
  // this time is ONLY valid for full bottles
  const pour_duration =
    (measurement.full_bottle_pour_duration *  liter_pour) / measurement.liters;

  return Math.round(pour_duration);
}

function get_air_bottle_pour_duration(liter_pour, current_bottle_fill, full_bottle_fill) {
  // with a full bottle (1.75L) of liquor, it takes ~2 seconds to pour
  // a shot (0.044L) out of the machine with our air pumps. We use
  // this ratio to calculate the time it takes other volumes to pour
  // out adjusted for bottle air pressure.

  // how long does it take to pour a shot with a FULL bottle of liquor with
  // our air pumps?
  const measurement = {
    liters: 0.044,
    full_bottle_pour_duration: 2000,
    near_empty_bottle_pour_duration: 5000
  };

  // adjust the duration from of measurement to the passed in liters we're pouring
  // this time is ONLY valid for full bottles
  const full_bottle_duration =
    (measurement.full_bottle_pour_duration * liter_pour) / measurement.liters;

  console.log('>>> full bottle pour duration:', full_bottle_duration);

  const fill_ratio = current_bottle_fill / full_bottle_fill;

  console.log('>>> fill_ratio', fill_ratio)

  // A ratio that we can adjust. The larger the number, the higher the
  // pour duration will be when we get down to the bottom of the bottle.
  const skew = 30;

  // adjust the pour time based on how empty the bottle is.
  //
  // e.g. (2000 + (5000 * ((100-50) / 100))) - 2000
  //
  //     2000 = full bottle shot pour (ms)
  //     5000 = empty-ish (near empty) bottle shot (ms)
  //     100 = full_bottle_fill (parameter)
  //     50 = current_bottle_fill (parameter)
  //
  const actual_duration = (
    measurement.full_bottle_pour_duration +
      (
        (
          measurement.near_empty_bottle_pour_duration -
          measurement.full_bottle_pour_duration
        )
        *
        (
          (full_bottle_fill - current_bottle_fill) / full_bottle_fill
        )
      )
  );

  console.log(`${full_bottle_duration} + (1 / ${fill_ratio}) * ${skew} - ${skew} = ${actual_duration}`)

  return Math.round(actual_duration);
}

exports.pour = (db) => async (req, res) => {

  const invalidations = [];
  const {
    id // drink_id
  } = req.params;

  if (typeof id !== 'string') {
    invalidations.push('missing required parameter id');
  }

  if (invalidations.length > 0) {
    res.status(400).json({ errors: invalidations });
    return;
  }

  try {
    const drink = await db.drink.getById(id);
    if (!drink) {
      res.status(404).json({ error: 'drink not found' });
      return;
    }

    console.log('drink: ', drink);

    const pours = await db.drink_pour.getPoursForDrink(id);
    if (pours.length <= 0) {
      res.status(404).json({
        error: 'pours for drink (id=${drink.id}) not found'
      });
      return;
    }

    const robotPours = [];

    for (let i = 0; i < pours.length; i++) {
      const pour = pours[i];
      const bottle = await db.bottle.getById(pour.bottle_id);

      console.log('>> bottle:', bottle)

      const device = await db.device.getByBottleID(bottle.id);

      console.log('>> device:', device);

      const device_type = await db.device_type.getById(device.device_type_id);
      const pins = await db.pin.getAllForAttachedDevice(device.id);
      const device_actions = [];

      for (let i = 0; i < pins.length; i++) {
        device_actions.push(await db.device_action.getById(pins[i].device_action_id));
      }

      const new_bottle_liters = bottle.current_liters - pour.liters;

      await db.bottle.setBottleLevel(bottle.id, new_bottle_liters);

      robotPours.push({ pour, bottle, device, device_type, device_actions, pins });
    }

    console.log(JSON.stringify(robotPours, null, 4));

    await Promise.all([
      // of course, all drinks get a straw
      robots.dispenseStraw().then(() => {
        console.log('finished dispensing straw');
      }),

    ].concat(robotPours.map(roboPour => { // construct all pours

      const { pour, bottle, device, device_type, device_actions, pins } = roboPour;

      let pour_duration_ms, pin;

      switch (device_type.name) {
        case 'air_pump':
          pour_duration_ms = get_air_bottle_pour_duration(
            pour.liters, bottle.current_liters, bottle.max_liters);

          const pin = pins[0].physical_pin_number;

          console.log(
            `(air, pin=${pin}, duration=${pour_duration_ms}) pouring '${bottle.name}'`);

          console.log('air:::firing');

          return robots.on_then_off(pin, pour_duration_ms).then(() => {
            console.log('air:::done!');
          });

        case 'peristaltic_pump':
          pour_duration_ms = get_peristaltic_bottle_pour_duration(pour.liters);

          const forwardPin = (function() {
            let action_id;
            for (let x = 0; x < device_actions.length; x++) {
              if (device_actions[x].name === 'pump_forward') {
                action_id = device_actions[x].id;
                break;
              }
            }

            let physical_pin_number;
            for (let y = 0; y < pins.length; y++) {
              if (pins[y].device_action_id === action_id) {
                physical_pin_number = pins[y].physical_pin_number;
              }
            }

            return physical_pin_number;
          })();

          const reversePin = (function() {
            let action_id;
            for (let x = 0; x < device_actions.length; x++) {
              if (device_actions[x].name === 'pump_reverse') {
                action_id = device_actions[x].id;
                break;
              }
            }

            let physical_pin_number;
            for (let y = 0; y < pins.length; y++) {
              if (pins[y].device_action_id === action_id) {
                physical_pin_number = pins[y].physical_pin_number;
              }
            }

            return physical_pin_number;
          })();

          console.log(
            `(peri, pin_f=${forwardPin}, pin_r=${reversePin},
              duration=${pour_duration_ms}, pouring='${bottle.name}'
            `);


          console.log(`peri:::firing forward pin ${forwardPin}`);
          // fire the pump in the forward direction
          return robots.on_then_off(forwardPin, pour_duration_ms).then(() => {
            console.log('peri:::done w/ forward!');
            // suck it all back with a 100ms buffer

            return new Promise((resolve) => setTimeout(resolve, 500));

          }).then(() => {
            console.log(`peri:::firing reverse pin ${reversePin}`);
            return robots.on_then_off(reversePin, (pour_duration_ms)).then(() => {
              console.log('peri:::done w/ reverse!');
            });
          });
      }
    })));

    res.status(200).json(Object.assign({}, drink, {
      pours: pours.map(pour => ({
        bottle_id: pour.bottle_id,
        liters: pour.liters
      }))
    }));

  } catch (error) {
    const id = `${Date.now()}-${Math.round(Math.random() * 9999) + 1000}`;
    res.status(500).json({ id, error: "internal server error" });
    console.error(id, error);
  }
};
