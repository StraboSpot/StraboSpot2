package com.strabospot2;

import android.util.Log;

import java.util.*;

public class MatrixCalculations {

    private float[] orginalMatrix;
    private float[] transposedMatrix;

    public MatrixCalculations(float[] matrix) {
        Log.i("Matrix", "This is from Matrix.java()" + Arrays.toString(matrix));
        this.orginalMatrix = matrix;
    }

    private double[] cartesianToSpherical(float mValue1, float mValue2, float mValue3) {
        double rho = Math.sqrt(Math.pow(mValue1, 2) + Math.pow(mValue2, 2) + Math.pow(mValue3, 2));
        double phi = 0;
        double theta = 0;

        if(rho == 0) {
            phi = 0;
            theta = 0;
        }
        else {
            phi = (Math.acos(mValue3/rho));
            if(rho * Math.sin(phi) == 0) {
                if(mValue3 >= 0) {
                    rho = mValue3;
                    phi = 0;
                }
                else {
                    rho = -mValue3;
                    phi = Math.PI;
                }
                theta = 0;
            }
            else {
                theta = Math.atan2(mValue2, mValue1);
            }
        }

        double value[] = {rho, phi, theta};
        return value;
    }

    public double[][] transposeMatrix() {
//        int original[][] = {{1, 3, 4}, {2, 4, 3}, {3, 4, 5}};
        float array2d[][] = {{orginalMatrix[0], orginalMatrix[1], orginalMatrix[2]}, {orginalMatrix[3], orginalMatrix[4], orginalMatrix[5]}, {orginalMatrix[6], orginalMatrix[7], orginalMatrix[8]}};
        float transposedArray[][] = new float[3][3];


        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                transposedArray[i][j] = array2d[j][i];
            }
        }

        double[] ENU_pole = cartesianToSpherical(transposedArray[2][1], transposedArray[2][0], transposedArray[2][2]);
        double[] ENU_tp = cartesianToSpherical(transposedArray[1][1], transposedArray[1][0], transposedArray[1][2]);
        Log.d("Transposed", "ENU_pole" + Arrays.toString(ENU_pole));
        Log.d("Transposed", "ENU_tp" + Arrays.toString(ENU_tp));

//        Log.i("Transposed", "Printing Matrix without transpose:");
//        for(int i=0;i<3;i++) {
//            for (int j = 0; j < 3; j++) {
//                Log.i("Transposed", i + " " +array2d[i][j] + " ");
//            }
//            Log.i("Transposed", "");//new line
//        }
//
//
        Log.i("Transposed", "Printing Matrix with transpose:");
        for(int i=0;i<3;i++) {
            for (int j = 0; j < 3; j++) {
                Log.i("Transposed", i + " " +transposedArray[i][j] + " ");
            }
            Log.i("Transposed", "");//new line
    }
        double[][] values = new double[][]{ENU_pole, ENU_tp};
        return values;
    }
}
