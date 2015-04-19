#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <wiringPiSPI.h>

NAN_METHOD(pwmSetRangeSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int range = args[0]->Int32Value();
	pwmSetRange(range);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(pwmSetModeSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int mode = args[0]->Int32Value();
	pwmSetMode(mode);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(pwmSetClockSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int divisor = args[0]->Int32Value();
	pwmSetClock(divisor);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(pwmWriteSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pin = args[0]->Int32Value();
	int value = args[1]->Int32Value();
	pwmWrite(pin, value);
	
	NanReturnValue(NanUndefined());
}