#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <wiringPiSPI.h>
#include <string.h>
#include <errno.h>

using v8::String;
using v8::Number;

NAN_METHOD(wiringPiSPIDataRWSync) {
  	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsObject() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int channel = args[0]->Int32Value();
	char* data = node::Buffer::Data(args[1]->ToObject());
	int len = args[2]->Int32Value();
	int ret = wiringPiSPIDataRW(channel, (unsigned char*)data, len);
	
	if(ret==-1) {
		NanThrowError(NanNew<String>(strerror(errno)));
	}
	NanReturnValue(NanNewBufferHandle(data, len));
}

NAN_METHOD(wiringPiSPISetupSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int channel = args[0]->Int32Value();
	int speed = args[1]->Int32Value();
	int ret = wiringPiSPISetup(channel, speed);
	
	if(ret==-1) {
		NanThrowError(NanNew<String>(strerror(errno)));
	}
	NanReturnValue(NanNew<Number>(ret));
}