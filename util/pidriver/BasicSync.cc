#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <string.h>
#include <errno.h>

using v8::String;
using v8::Number;

NAN_METHOD(wiringPiSetupGpioSync) {
  	NanScope();

	if ( args.Length() != 0  ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int ret = wiringPiSetupGpio();
	
	if(ret==-1) {
		NanThrowError(NanNew<String>(strerror(errno)));
	}
	NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(pullUpDnControlSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pin = args[0]->Int32Value();
	int pud = args[1]->Int32Value();
	pullUpDnControl(pin, pud);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(digitalReadSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pin = args[0]->Int32Value();
	int ret = digitalRead(pin);
	
	NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(digitalWriteSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pin = args[0]->Int32Value();
	int value = args[1]->Int32Value();
	digitalWrite(pin, value);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(pinModeSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pin = args[0]->Int32Value();
	int mode = args[1]->Int32Value();
	pinMode(pin, mode);
	
	NanReturnValue(NanUndefined());
}