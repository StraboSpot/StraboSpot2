//
//  Compass.m
//  StraboSpot2
//
//  Created by Nathan  Novak on 10/8/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(Compass, RCTEventEmitter)
//RCT_EXTERN_METHOD(getHeading)
RCT_EXTERN_METHOD(myAccelermoter)
RCT_EXTERN_METHOD(myAcceleration)
RCT_EXTERN_METHOD(myDeviceRotation)
RCT_EXTERN_METHOD(stopObserving)

@end
