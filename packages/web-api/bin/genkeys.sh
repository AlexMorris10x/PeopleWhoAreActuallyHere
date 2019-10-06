#!/usr/bin/env sh

echo "this script creates two files in the cwd:"
echo ""
echo " - private.pem"
echo " - public.pem"
echo ""
echo "If this is not what you want, exit now."
echo ""
echo "You have 3 seconds."
echo ""
sleep 1
echo "1..."
sleep 1
echo "2..."
sleep 1
echo "3..."
sleep 1

openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout > public.pem
