#ifndef _BasicAsync
#define _BasicAsync

#include <nan.h>

NAN_METHOD(wiringPiSetupGpioAsync);
NAN_METHOD(pullUpDnControlAsync);
NAN_METHOD(digitalReadAsync);
NAN_METHOD(digitalWriteAsync);
NAN_METHOD(pinModeAsync);

#endif