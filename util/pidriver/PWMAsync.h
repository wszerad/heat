#ifndef _PWMAsync
#define _PWMAsync

#include <nan.h>

NAN_METHOD(pwmSetRangeAsync);
NAN_METHOD(pwmSetModeAsync);
NAN_METHOD(pwmSetClockAsync);
NAN_METHOD(pwmWriteAsync);

#endif