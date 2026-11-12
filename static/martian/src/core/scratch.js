// Scratch vectors shared by the gameplay modules (never held across a call that might reuse them).
import * as THREE from 'three';
export const _pe = new THREE.Vector3();
export const _pn = new THREE.Vector3();
export const _pd = new THREE.Vector3();
export const _pv = new THREE.Vector3();
export const _fe = new THREE.Vector3();
export const _fn = new THREE.Vector3();
export const _v1 = new THREE.Vector3();
export const _v2 = new THREE.Vector3();
export const _v3 = new THREE.Vector3();
export const _du = new THREE.Vector3();
export const _q1 = new THREE.Quaternion();
export const _q2 = new THREE.Quaternion();
export const Y_AXIS = new THREE.Vector3(0, 1, 0);
export const X_AXIS = new THREE.Vector3(1, 0, 0);
