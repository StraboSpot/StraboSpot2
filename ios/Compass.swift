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
  var matrixArray = Array<CMRotationMatrix>();

  var motion = CMMotionManager()
  let locationManager = CLLocationManager()
  private var count = 0;
  private var heading: Double = 0

//  @objc
//  func myAccelerometer() {
//    if motion.isAccelerometerAvailable {
//      print("available")
//      motion.accelerometerUpdateInterval = 0.1
//      motion.startAccelerometerUpdates(to: OperationQueue.main) { (data, error) in
//            if let trueData = data {
//              self.accelerationX = Double(trueData.acceleration.x).rounded(toPlaces: 3)
//              self.accelerationY = Double(trueData.acceleration.y).rounded(toPlaces: 3)
//              self.accelerationZ = Double(trueData.acceleration.z).rounded(toPlaces: 3)
//              self.sendEvent(withName: "acceleration",
//                             body: [
//                              "accelerationX": self.accelerationX,
//                              "accelerationY": self.accelerationY,
//                              "accelerationZ": self.accelerationZ
//                            ])
//                    }
//                }
//
//    } else {print("not available")}
//  }

  @objc
  func getDeviceRotation() {
          guard motion.isDeviceMotionAvailable else {
              return
          }

          let myFrame = CMAttitudeReferenceFrame.xTrueNorthZVertical;
          guard CMMotionManager.availableAttitudeReferenceFrames().contains(myFrame) else {
              return
          }
              let queue = OperationQueue.main

    motion.deviceMotionUpdateInterval = 0.1
          motion.startDeviceMotionUpdates(using: .xTrueNorthZVertical, to: queue, withHandler: { (data: CMDeviceMotion?, error: Error?) in
                  guard let data = data, error == nil else {
                      return
                  }
                  let rotationMatrix = data.attitude.rotationMatrix
                  self.matrixArray.append(rotationMatrix)
            print("MatrixArray", self.matrixArray);
            print("MatrixArray", self.matrixArray.count);

                  if (self.matrixArray.count > 5){

                    self.matrixArray.removeFirst();
                    print("MatrixArray", self.matrixArray);
                  }

            let m11Avg = self.matrixArray.map{$0.m11}.reduce(0,+) / Double(self.matrixArray.count)
            let m12Avg = self.matrixArray.map{$0.m12}.reduce(0,+) / Double(self.matrixArray.count)
            let m13Avg = self.matrixArray.map{$0.m13}.reduce(0,+) / Double(self.matrixArray.count)
            let m21Avg = self.matrixArray.map{$0.m21}.reduce(0,+) / Double(self.matrixArray.count)
            let m22Avg = self.matrixArray.map{$0.m22}.reduce(0,+) / Double(self.matrixArray.count)
            let m23Avg = self.matrixArray.map{$0.m23}.reduce(0,+) / Double(self.matrixArray.count)
            let m31Avg = self.matrixArray.map{$0.m31}.reduce(0,+) / Double(self.matrixArray.count)
            let m32Avg = self.matrixArray.map{$0.m32}.reduce(0,+) / Double(self.matrixArray.count)
            let m33Avg = self.matrixArray.map{$0.m33}.reduce(0,+) / Double(self.matrixArray.count)


//                  let ENU_pole = self.cartesianToSpherical(mValue1: -m32Avg, mValue2: m31Avg,mValue3: m33Avg)
//                  let ENU_TP = self.cartesianToSpherical(mValue1: -m22Avg, mValue2: m21Avg, mValue3: m23Avg)
//
                  let heading = self.mod(value: (data.heading - 270), degrees: 360).rounded(toPlaces: 0)
//                  let strikeAndDipData = self.strikeAndDip(array: ENU_pole)
//                  let trendAndPlungeData = self.trendAndPlunge(array: ENU_TP)
//                  let strike = Double(strikeAndDipData[0]).rounded(toPlaces: 0);
//                  let dip = Int(strikeAndDipData[1]);
//                  let trend = Double(trendAndPlungeData[0]).rounded(toPlaces: 0);
//                  let plunge = Int(trendAndPlungeData[1]);

//                  print(rotationMatrix)

                self.sendEvent(withName: "rotationMatrix",
                           body: [
//                            "strike": strike,
//                            "dip": dip,
//                            "trend": trend,
//                            "plunge": plunge,
                            "heading": heading,

                            "M11": m11Avg,
                            "M12": m12Avg,
                            "M13": m13Avg,
                            "M21": m21Avg,
                            "M22": m22Avg,
                            "M23": m23Avg,
                            "M31": m31Avg,
                            "M32": m32Avg,
                            "M33": m33Avg,
                            ])
          })
      }

//      func cartesianToSpherical (mValue1: Double, mValue2: Double, mValue3: Double) -> [Double]{
//          var rho = (pow(mValue1, 2) + pow(mValue2, 2) + pow(mValue3, 2)).squareRoot();
//          var phi: Double = 0;
//          var theta: Double = 0;
//          if (rho == 0) {
//              phi = 0;
//              theta = 0;
//          }
//          else{
//              phi = Double((acos(mValue3/rho)))
//              if (rho * sin((phi)) == 0) {
//                  if (mValue3 >= 0){
//                      rho = mValue3;
//                      phi = 0;
//                      theta = 0;
//                  }
//                  else {
//                      rho = -mValue3;
//                      phi = Double.pi
//                      theta = 0;
//                  }
//              }
//              else {
//                  theta = atan2(mValue2, mValue1)
//              }
//          }
//          return [rho, phi, theta]
//      }

//      func strikeAndDip (array: Array<Double> ) -> [Double] {
//          let phi = array[1]
//          let theta = array[2]
//          var strikeDeg: Double = 0;
//          var dipDeg: Double = 0;
//          if (phi <= Double.pi/2) {
//              strikeDeg = Double(mod(value: (Double(360 - theta * (180/Double.pi))), degrees: 360));
//              dipDeg = phi * (180/Double.pi)
//
//          }
//          else {
//              strikeDeg = Double(mod(value: 360 - (theta + Double.pi) * (180/Double.pi), degrees: 360));
//              dipDeg = (Double.pi - phi) * (180/Double.pi)
//          }
//          return [strikeDeg, dipDeg]
//      }

//      func trendAndPlunge (array: Array<Double>) -> [Double] {
//          let phi = array[1];
//          let theta = array[2];
//          var trendDeg: Double = Double(mod(value: 90 - theta * (180/Double.pi), degrees: 360));
//          var plungeDeg: Double = phi * (180/Double.pi) - 90;
//          if (plungeDeg < 0) {
//              trendDeg = Double(mod(value: trendDeg + 180, degrees: 360));
//              plungeDeg = -plungeDeg;
//          }
//          return [trendDeg, plungeDeg]
//      }

      func mod(value: Double, degrees: Double) -> Double {
          return ((value .truncatingRemainder(dividingBy: degrees) ) + degrees) .truncatingRemainder(dividingBy: (degrees))
      }


  @objc
  override func stopCompass() {
    motion.stopAccelerometerUpdates()
    motion.stopDeviceMotionUpdates()
//    motion.stopAccelerometerUpdates()
//    motion.stopDeviceMotionUpdates()
    locationManager.stopUpdatingHeading()
    print("Compass Events Stopped in iOS code")
  }

  // we need to override this method and
   // return an array of event names that we can listen to
  override func supportedEvents() -> [String]! {
     return ["rotationMatrix"]
   }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

//extension Double {
//  func mod(value: Double, degrees: Double) -> Double {
//      return ((value .truncatingRemainder(dividingBy: degrees) ) + degrees) .truncatingRemainder(dividingBy: (degrees))
//  }
//}
extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded()/divisor
    }
}
