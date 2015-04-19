#include <node.h>
#include <node_buffer.h>
#include <nan.h>
#include <wiringPi.h>
#include <lcd.h>
#include <string.h>
#include <errno.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;
using v8::Number;
using v8::String;

NAN_METHOD(lcdInitSync) {
  	NanScope();

	if ( args.Length() != 13  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() || !args[3]->IsInt32() || !args[4]->IsInt32() || !args[5]->IsInt32() || !args[6]->IsInt32() || !args[7]->IsInt32() || !args[8]->IsInt32() || !args[9]->IsInt32() || !args[10]->IsInt32() || !args[11]->IsInt32() || !args[12]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int rows = args[0]->Int32Value();
	int cols = args[1]->Int32Value();
	int bits = args[2]->Int32Value();
	int rs = args[3]->Int32Value();
	int strb = args[4]->Int32Value();
	int d0 = args[5]->Int32Value();
	int d1 = args[6]->Int32Value();
	int d2 = args[7]->Int32Value();
	int d3 = args[8]->Int32Value();
	int d4 = args[9]->Int32Value();
	int d5 = args[10]->Int32Value();
	int d6 = args[11]->Int32Value();
	int d7 = args[12]->Int32Value();
	int ret = lcdInit(rows, cols, bits, rs, strb, d0, d1, d2, d3, d4, d5, d6, d7);
	
	if(ret==-1) {
		NanThrowError(NanNew<String>(strerror(errno)));
	}
	NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(lcdClearSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int fd = args[0]->Int32Value();
	lcdClear(fd);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(lcdHomeSync) {
  	NanScope();

	if ( args.Length() != 1  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int fd = args[0]->Int32Value();
	lcdHome(fd);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(lcdPositionSync) {
  	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int fd = args[0]->Int32Value();
	int x = args[1]->Int32Value();
	int y = args[2]->Int32Value();
	lcdPosition(fd, x, y);
	
	NanReturnValue(NanUndefined());
}

NAN_METHOD(lcdPutsSync) {
  	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() || !args[1]->IsObject() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int fd = args[0]->Int32Value();
	size_t len = node::Buffer::Length(args[1]->ToObject());
	char* string = node::Buffer::Data(args[1]->ToObject());
    string[len] = '\0';
	
	lcdPuts(fd, string);
	
	NanReturnValue(NanUndefined());
}