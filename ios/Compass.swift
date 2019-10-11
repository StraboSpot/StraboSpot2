//
//  Compass.swift
//  StraboSpot2
//
//  Created by Nathan  Novak on 10/8/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import CoreMotion
import CoreLocation

@objc(Compass)
class Compass: RCTEventEmitter {
  
  var motion = CMMotionManager()
  let locationManager = CLLocationManager()
  private var count = 0;
  private var accelerationX: Double = 0;
  private var accelerationY:  Double = 0;
  private var accelerationZ: Double = 0;
//  private var heading: Int = 0
  
  
//  @objc
//  func getHeading() {
//    let isHeadingAvailable = CLLocationManager.headingAvailable()
//    print("Heading Available:", isHeadingAvailable)
//    if (isHeadingAvailable) {
//      
////      let adjustedHeading = Int(mod(value: locationManager.heading + 90, degrees: 360))
////      locationManager.startUpdatingHeading()
////
////      print("Adjusted Heading: \(String(describing: adjustedHeading))")
////
////     self .sendEvent(withName: "getHeading", body: ["heading": adjustedHeading])
//    }
//  }
  
  @objc
  func myAccelermoter() {
    if motion.isAccelerometerAvailable {
      print("available")
      motion.accelerometerUpdateInterval = 0.1
      motion.startAccelerometerUpdates(to: OperationQueue.main) { (data, error) in
//                    print(data as Any, "Error", error as Any)
            if let trueData = data {
              self.accelerationX = Double(trueData.acceleration.x).rounded(toPlaces: 3)
              self.accelerationY = Double(trueData.acceleration.y).rounded(toPlaces: 3)
              self.accelerationZ = Double(trueData.acceleration.z).rounded(toPlaces: 3)
              self.sendEvent(withName: "acceleration",
                             body: [
                              "accelerationX": self.accelerationX,
                              "accelerationY": self.accelerationY,
                              "accelerationZ": self.accelerationZ
                            ])
                    }
                }

    } else {print("not available")}
  }
  
  @objc
  func myDeviceRotation() {
          guard motion.isDeviceMotionAvailable else {
//              print("Device Motion is not Available.")
              return
          }
          
          let myFrame = CMAttitudeReferenceFrame.xTrueNorthZVertical;
          guard CMMotionManager.availableAttitudeReferenceFrames().contains(myFrame) else {
//              print("The reference frame xTrueNorthZVerticle is not available.")
              return
          }
              let queue = OperationQueue.main
      
              motion.deviceMotionUpdateInterval = 0.1
          motion.startDeviceMotionUpdates(using: .xTrueNorthZVertical, to: queue, withHandler: { (data: CMDeviceMotion?, error: Error?) in
                  guard let data = data, error == nil else {
                      return
                  }
//                  print(data as Any)
                  let rotationMatrix = data.attitude.rotationMatrix
                      let m21 = rotationMatrix.m21
                      let m22 = rotationMatrix.m22
                      let m23 = rotationMatrix.m23
                      let m31 = rotationMatrix.m31
                      let m32 = rotationMatrix.m32
                      let m33 = rotationMatrix.m33
              
                  let ENU_pole = self.cartesianToSpherical(mValue1: -m32, mValue2: m31,mValue3: m33)
                  let ENU_TP = self.cartesianToSpherical(mValue1: -m22, mValue2: m21, mValue3: m23)
  //                print("ENU_pole", ENU_pole)
              
                  let strikeAndDipData = self.strikeAndDip(array: ENU_pole)
                  let trendAndPlungeData = self.trendAndPlunge(array: ENU_TP)
                  let strike = Double(strikeAndDipData[0]).rounded(toPlaces: 0);
                  let dip = Int(strikeAndDipData[1]);
                  let trend = Double(trendAndPlungeData[0]).rounded(toPlaces: 0);
                  let plunge = Int(trendAndPlungeData[1]);

                 
            self.sendEvent(withName: "rotationMatrix",
                           body: [
                            "strike": strike,
                            "dip": dip,
                            "trend": trend,
                            "plunge": plunge,
                            ])
          })
      }
      
      func cartesianToSpherical (mValue1: Double, mValue2: Double, mValue3: Double) -> [Double]{
          var rho = (pow(mValue1, 2) + pow(mValue2, 2) + pow(mValue3, 2)).squareRoot();
          var phi: Double = 0;
          var theta: Double = 0;
          if (rho == 0) {
              phi = 0;
              theta = 0;
          }
          else{
              phi = Double((acos(mValue3/rho)))
              if (rho * sin((phi)) == 0) {
                  if (mValue3 >= 0){
                      rho = mValue3;
                      phi = 0;
                      theta = 0;
                  }
                  else {
                      rho = -mValue3;
                      phi = Double.pi
                      theta = 0;
                  }
              }
              else {
                  theta = atan2(mValue2, mValue1)
              }
          }
          return [rho, phi, theta]
      }
      
      func strikeAndDip (array: Array<Double> ) -> [Double] {
          let phi = array[1]
          let theta = array[2]
          var strikeDeg: Double = 0;
          var dipDeg: Double = 0;
          if (phi <= Double.pi/2) {
              strikeDeg = Double(mod(value: (Double(360 - theta * (180/Double.pi))), degrees: 360));
              dipDeg = phi * (180/Double.pi)

          }
          else {
              strikeDeg = Double(mod(value: 360 - (theta + Double.pi) * (180/Double.pi), degrees: 360));
              dipDeg = (Double.pi - phi) * (180/Double.pi)
          }
          return [strikeDeg, dipDeg]
      }
      
      func trendAndPlunge (array: Array<Double>) -> [Double] {
          let phi = array[1];
          let theta = array[2];
          var trendDeg: Double = Double(mod(value: 90 - theta * (180/Double.pi), degrees: 360));
          var plungeDeg: Double = phi * (180/Double.pi) - 90;
          if (plungeDeg < 0) {
              trendDeg = Double(mod(value: trendDeg + 180, degrees: 360));
              plungeDeg = -plungeDeg;
          }
          return [trendDeg, plungeDeg]
      }
      
      func mod(value: Double, degrees: Double) -> Double {
          return ((value .truncatingRemainder(dividingBy: degrees) ) + degrees) .truncatingRemainder(dividingBy: (degrees))
      }

  
  @objc
  override func stopObserving() {
    motion.stopAccelerometerUpdates()
    motion.stopDeviceMotionUpdates()
    locationManager.stopUpdatingHeading()
    print("Events Stopped")
  }
  
  // we need to override this method and
   // return an array of event names that we can listen to
   override func supportedEvents() -> [String]! {
     return ["acceleration", "rotationMatrix"]
   }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
//  func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
//           print("Heading: \(newHeading.trueHeading)")
//    heading = Int(mod(value: newHeading.trueHeading + 90, degrees: 360))
//           }
}

extension Double {
  func mod(value: Double, degrees: Double) -> Double {
      return ((value .truncatingRemainder(dividingBy: degrees) ) + degrees) .truncatingRemainder(dividingBy: (degrees))
  }
}
extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded()/divisor
    }
}

    
