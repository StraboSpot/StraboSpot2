package com.strabospot2;

import android.util.Log;

import java.util.*;

public class MatrixCalculations {

    private static double[][] adjustMatrixForDeclination(float[] matrix, float declination) {
        double[][] firstMatrix = {
                new double[] {matrix[0], matrix[1], matrix[2]},
                new double[] {matrix[3], matrix[4], matrix[5]},
                new double[] {matrix[6], matrix[7], matrix[8]}
        };

        double[][] secondMatrix = {
                new double[] {Math.cos(declination), -Math.sin(declination), 0},
                new double[] {Math.sin(declination), Math.cos(declination), 0},
                new double[] {0, 0, 1}
        };
        double [][] result = new double[firstMatrix.length][secondMatrix.length];

        for (int row = 0; row < result.length; row++) {
            for (int col = 0; col < result[row].length; col++) {
                result[row][col] = multiplyMatricesCell(firstMatrix, secondMatrix, row, col);
            }
        }
        return result;
    }

    private static double multiplyMatricesCell(double[][] firstMatrix, double[][] secondMatrix, int row, int col) {
        double cell = 0;
        for (int i = 0; i < secondMatrix.length; i++) {
            cell += firstMatrix[row][i] * secondMatrix[i][col];
        }
        return cell;
    }

    public static double[] cartesianToSpherical(double mValue1, double mValue2, double mValue3) {
        double rho = Math.sqrt(Math.pow(mValue1, 2) + Math.pow(mValue2, 2) + Math.pow(mValue3, 2));
        double phi = 0;
        double theta = 0;

        if (rho == 0) {
            phi = 0;
            theta = 0;
        } else {
            phi = (Math.acos(mValue3 / rho));
            if (rho * Math.sin(phi) == 0) {
                if (mValue3 >= 0) {
                    rho = mValue3;
                    phi = 0;
                } else {
                    rho = -mValue3;
                    phi = Math.PI;
                }
                theta = 0;
            } else {
                theta = Math.atan2(mValue2, mValue1);
            }
        }

        return new double[]{rho, phi, theta};
    }


    public static double[] strikeAndDip(double[] ENU_pole) {
        double phi = ENU_pole[1];
        double theta = ENU_pole[2];
        double strikeDeg = 0;
        double dipDeg = 0;

        if (phi <= Math.PI / 2) {
            strikeDeg = mod(360 - theta * (180 / Math.PI));
            dipDeg = Math.round(phi * (180 / Math.PI));
        } else {
            strikeDeg = mod(360 - (theta + Math.PI) * (180 / Math.PI));
            dipDeg = Math.round((Math.PI - phi) * (180 / Math.PI));
        }
        return new double[]{strikeDeg, dipDeg};
    }

    public static double[] trendAndPlunge(double[] ENU_tp) {
        double phi = ENU_tp[1];
        double theta = ENU_tp[2];
        double trendDeg = mod(90 - theta * (180 / Math.PI));
        double plungeDeg = phi * (180 / Math.PI) - 90;
        if(plungeDeg < 0) {
            trendDeg = mod(trendDeg + 180);
            plungeDeg = -plungeDeg;
        }
        return new double[] {trendDeg, plungeDeg};
    }

    private static double mod(double value) {
        double a = value;
        double b = (a % 360) + 360;
        double c = b % 360;
        return c;
    }


    public static float[] transposeMatrix(float[] originalMatrix, float declination) {
        double[][] adjustedMatrix = adjustMatrixForDeclination(originalMatrix, declination);

        float[][] transposedArray = new float[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                transposedArray[i][j] = (float) adjustedMatrix[j][i];
            }
        }


//
//         Log.i("Matrix", "Printing Matrix without transpose:");
//         for (int i = 0; i < 3; i++) {
//             for (int j = 0; j < 3; j++) {
//                 Log.i("Matrix", array2d[i][j] + " ");
//             }
//             Log.i("Matrix", "");//new line
//         }

//                 Log.i("Transposed", "Printing Matrix with transpose:");
//                 for (int i = 0; i < 3; i++) {
//                     for (int j = 0; j < 3; j++) {
//                         Log.i("Transposed", i + " " + transposedArray[i][j] + " ");
//                     }
//                     Log.i("Transposed", "");//new line
//                 }

//         Log.i("Matrix", "2-D Array: \n[");
//         // printing a 2-D array using two nested loops
//         for (float[] array : transposedArray) {
//             Log.i("Matrix", "[");
//             for (float n : array) {
//                 Log.i("Matrix", n + " "); // printing each item
//             }
//             Log.i("Matrix", "]"); // printing new line
//         }
//         Log.i("Matrix", "]\n");

       return new float[]{transposedArray[0][0], transposedArray[0][1], transposedArray[0][2], transposedArray[1][0], transposedArray[1][1], transposedArray[1][2], transposedArray[2][0], transposedArray[2][1], transposedArray[2][2]};
    }
}

