var yg=0,Fd=1,_g=2;var Qo=1,qc=2,za=3,Xi=0,an=1,Mn=2,ws=0,Ts=1,el=2,Nd=3,Ud=4,Mg=5;var Hr=100,Sg=101,wg=102,Tg=103,Eg=104,Ag=200,Rg=201,Cg=202,Pg=203,Od=204,kd=205,Ig=206,Lg=207,Dg=208,Fg=209,Ng=210,Ug=211,Og=212,kg=213,Bg=214,xc=0,yc=1,_c=2,Ma=3,Mc=4,Sc=5,wc=6,Tc=7,Bd=0,zg=1,Hg=2,ui=0,zd=1,Hd=2,Gd=3,Vd=4,Wd=5,qd=6,Xd=7,Td="attached",Gg="detached",jd=300,Gr=301,Ha=302,Xc=303,jc=304,Gi=1e3,oi=1001,Sa=1002,jt=1003,Kc=1004;var Vr=1005;var Gt=1006,Ga=1007;var Sn=1008;var wn=1009,Kd=1010,Yd=1011,Va=1012,Yc=1013,Ci=1014,Jn=1015,on=1016,Jc=1017,$c=1018,Wr=1020,Jd=35902,$d=35899,Zd=1021,Qd=1022,zn=1023,fs=1026,Es=1027,Zc=1028,Qc=1029,sr=1030,eh=1031;var th=1033,tl=33776,nl=33777,il=33778,sl=33779,nh=35840,ih=35841,sh=35842,rh=35843,ah=36196,oh=37492,lh=37496,ch=37488,hh=37489,rl=37490,uh=37491,dh=37808,fh=37809,ph=37810,mh=37811,gh=37812,vh=37813,bh=37814,xh=37815,yh=37816,_h=37817,Mh=37818,Sh=37819,wh=37820,Th=37821,Eh=36492,Ah=36494,Rh=36495,Ch=36283,Ph=36284,al=36285,Ih=36286,Lh=2200,Vg=2201,Wg=2202,Pr=2300,Ir=2301,vc=2302,Ed=2303,Ar=2400,Rr=2401,Ro=2402,Dh=2500,qg=2501,ef=0,ol=1,Wa=2,Xg=3200;var Fh=0,jg=1,di="",Ht="srgb",Dn="srgb-linear",Co="linear",wt="srgb";var bc=7680;var Kg=519,Yg=512,Jg=513,$g=514,tf=515,Zg=516,Qg=517,nf=518,sf=519,rf=35044,qa=35048;var af="300 es",li=2e3,er=2001;function Fb(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Nb(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function wa(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function e0(){let i=wa("canvas");return i.style.display="block",i}var Fm={},Ta=null;function Po(...i){let e="THREE."+i.shift();Ta?Ta("log",e,...i):console.log(e,...i)}function t0(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function ze(...i){i=t0(i);let e="THREE."+i.shift();if(Ta)Ta("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ke(...i){i=t0(i);let e="THREE."+i.shift();if(Ta)Ta("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Cr(...i){let e=i.join(" ");e in Fm||(Fm[e]=!0,ze(...i))}function n0(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var i0={[xc]:xc,[_c]:wc,[Mc]:Mc,[Ma]:Sc,[yc]:yc,[wc]:_c,[Tc]:Tc,[Sc]:Ma},Ri=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},xn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Nm=1234567,Eo=Math.PI/180,Lr=180/Math.PI;function ji(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(xn[i&255]+xn[i>>8&255]+xn[i>>16&255]+xn[i>>24&255]+"-"+xn[e&255]+xn[e>>8&255]+"-"+xn[e>>16&15|64]+xn[e>>24&255]+"-"+xn[t&63|128]+xn[t>>8&255]+"-"+xn[t>>16&255]+xn[t>>24&255]+xn[n&255]+xn[n>>8&255]+xn[n>>16&255]+xn[n>>24&255]).toLowerCase()}function ut(i,e,t){return Math.max(e,Math.min(t,i))}function of(i,e){return(i%e+e)%e}function Ub(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Ob(i,e,t){return i!==e?(t-i)/(e-i):0}function Ao(i,e,t){return(1-t)*i+t*e}function kb(i,e,t,n){return Ao(i,e,1-Math.exp(-t*n))}function Bb(i,e=1){return e-Math.abs(of(i,e*2)-e)}function zb(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Hb(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Gb(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Vb(i,e){return i+Math.random()*(e-i)}function Wb(i){return i*(.5-Math.random())}function qb(i){i!==void 0&&(Nm=i);let e=Nm+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Xb(i){return i*Eo}function jb(i){return i*Lr}function Kb(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Yb(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function lf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jb(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),p=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*d,o*c);break;case"YZY":i.set(l*d,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*d,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*h,o*c);break;default:ze("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Nh(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function cf(i,e){if(e.constructor===Float32Array)return i;let t=Nh(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function hf(i,e){if(e.constructor===Float32Array)return i;let t=Nh(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var Uh={DEG2RAD:Eo,RAD2DEG:Lr,generateUUID:ji,clamp:ut,euclideanModulo:of,mapLinear:Ub,inverseLerp:Ob,lerp:Ao,damp:kb,pingpong:Bb,smoothstep:zb,smootherstep:Hb,randInt:Gb,randFloat:Vb,randFloatSpread:Wb,seededRandom:qb,degToRad:Xb,radToDeg:jb,isPowerOfTwo:Kb,ceilPowerOfTwo:Yb,floorPowerOfTwo:lf,setQuaternionFromProperEuler:Jb,normalize:hf,denormalize:cf},mf=class mf{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};mf.prototype.isVector2=!0;var He=mf,dt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(u!==_||l!==d||c!==p||h!==g){let v=l*d+c*p+h*g+u*_;v<0&&(d=-d,p=-p,g=-g,_=-_,v=-v);let m=1-o;if(v<.9995){let y=Math.acos(v),M=Math.sin(y);m=Math.sin(m*y)/M,o=Math.sin(o*y)/M,l=l*m+d*o,c=c*m+p*o,h=h*m+g*o,u=u*m+_*o}else{l=l*m+d*o,c=c*m+p*o,h=h*m+g*o,u=u*m+_*o;let y=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=y,c*=y,h*=y,u*=y}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*u+l*p-c*d,e[t+1]=l*g+h*d+c*u-o*p,e[t+2]=c*g+h*p+o*d-l*u,e[t+3]=h*g-o*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:ze("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},gf=class gf{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Um.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Um.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return td.copy(this).projectOnVector(e),this.sub(td)}reflect(e){return this.sub(td.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};gf.prototype.isVector3=!0;var C=gf,td=new C,Um=new dt,vf=class vf{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],_=s[0],v=s[3],m=s[6],y=s[1],M=s[4],x=s[7],T=s[2],S=s[5],b=s[8];return r[0]=a*_+o*y+l*T,r[3]=a*v+o*M+l*S,r[6]=a*m+o*x+l*b,r[1]=c*_+h*y+u*T,r[4]=c*v+h*M+u*S,r[7]=c*m+h*x+u*b,r[2]=d*_+p*y+g*T,r[5]=d*v+p*M+g*S,r[8]=d*m+p*x+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,g=t*u+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Cr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(nd.makeScale(e,t)),this}rotate(e){return Cr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(nd.makeRotation(-e)),this}translate(e,t){return Cr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(nd.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};vf.prototype.isMatrix3=!0;var Ye=vf,nd=new Ye,Om=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),km=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function $b(){let i={enabled:!0,workingColorSpace:Dn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===wt&&(s.r=ds(s.r),s.g=ds(s.g),s.b=ds(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===wt&&(s.r=_a(s.r),s.g=_a(s.g),s.b=_a(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===di?Co:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Dn]:{primaries:e,whitePoint:n,transfer:Co,toXYZ:Om,fromXYZ:km,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ht},outputColorSpaceConfig:{drawingBufferColorSpace:Ht}},[Ht]:{primaries:e,whitePoint:n,transfer:wt,toXYZ:Om,fromXYZ:km,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ht}}}),i}var ct=$b();function ds(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function _a(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var oa,Ec=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{oa===void 0&&(oa=wa("canvas")),oa.width=e.width,oa.height=e.height;let s=oa.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=oa}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=wa("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ds(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ds(t[n]/255)*255):t[n]=ds(t[n]);return{data:t,width:e.width,height:e.height}}else return ze("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Zb=0,Ea=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Zb++}),this.uuid=ji(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(id(s[a].image)):r.push(id(s[a]))}else r=id(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function id(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ec.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(ze("Texture: Unable to serialize Texture."),{})}var Qb=0,sd=new C,rn=class i extends Ri{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=oi,s=oi,r=Gt,a=Sn,o=zn,l=wn,c=i.DEFAULT_ANISOTROPY,h=di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qb++}),this.uuid=ji(),this.name="",this.source=new Ea(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new He(0,0),this.repeat=new He(1,1),this.center=new He(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(sd).x}get height(){return this.source.getSize(sd).y}get depth(){return this.source.getSize(sd).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ze(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ze(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==jd)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Gi:e.x=e.x-Math.floor(e.x);break;case oi:e.x=e.x<0?0:1;break;case Sa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Gi:e.y=e.y-Math.floor(e.y);break;case oi:e.y=e.y<0?0:1;break;case Sa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};rn.DEFAULT_IMAGE=null;rn.DEFAULT_MAPPING=jd;rn.DEFAULT_ANISOTROPY=1;var bf=class bf{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],_=l[2],v=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-v)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+v)<.1&&Math.abs(c+p+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,x=(p+1)/2,T=(m+1)/2,S=(h+d)/4,b=(u+_)/4,w=(g+v)/4;return M>x&&M>T?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=S/n,r=b/n):x>T?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=S/s,r=w/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=b/r,s=w/r),this.set(n,s,r,t),this}let y=Math.sqrt((v-g)*(v-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(v-g)/y,this.y=(u-_)/y,this.z=(d-h)/y,this.w=Math.acos((c+p+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};bf.prototype.isVector4=!0;var xt=bf,Ac=class extends Ri{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new rn({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Gt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ea(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Kt=class extends Ac{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Io=class extends rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Aa=class extends rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=jt,this.minFilter=jt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Wc=class Wc{constructor(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v)}set(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=g,m[11]=_,m[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Wc().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/la.setFromMatrixColumn(e,0).length(),r=1/la.setFromMatrixColumn(e,1).length(),a=1/la.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d+_*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=g*c-p,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=g*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+g,t[10]=d-_*u}else if(e.order==="XZY"){let d=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ex,e,tx)}lookAt(e,t,n){let s=this.elements;return Xn.subVectors(e,t),Xn.lengthSq()===0&&(Xn.z=1),Xn.normalize(),js.crossVectors(n,Xn),js.lengthSq()===0&&(Math.abs(n.z)===1?Xn.x+=1e-4:Xn.z+=1e-4,Xn.normalize(),js.crossVectors(n,Xn)),js.normalize(),Xl.crossVectors(Xn,js),s[0]=js.x,s[4]=Xl.x,s[8]=Xn.x,s[1]=js.y,s[5]=Xl.y,s[9]=Xn.y,s[2]=js.z,s[6]=Xl.z,s[10]=Xn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],_=n[6],v=n[10],m=n[14],y=n[3],M=n[7],x=n[11],T=n[15],S=s[0],b=s[4],w=s[8],L=s[12],P=s[1],F=s[5],O=s[9],z=s[13],D=s[2],G=s[6],X=s[10],H=s[14],ie=s[3],j=s[7],K=s[11],$=s[15];return r[0]=a*S+o*P+l*D+c*ie,r[4]=a*b+o*F+l*G+c*j,r[8]=a*w+o*O+l*X+c*K,r[12]=a*L+o*z+l*H+c*$,r[1]=h*S+u*P+d*D+p*ie,r[5]=h*b+u*F+d*G+p*j,r[9]=h*w+u*O+d*X+p*K,r[13]=h*L+u*z+d*H+p*$,r[2]=g*S+_*P+v*D+m*ie,r[6]=g*b+_*F+v*G+m*j,r[10]=g*w+_*O+v*X+m*K,r[14]=g*L+_*z+v*H+m*$,r[3]=y*S+M*P+x*D+T*ie,r[7]=y*b+M*F+x*G+T*j,r[11]=y*w+M*O+x*X+T*K,r[15]=y*L+M*z+x*H+T*$,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],_=e[7],v=e[11],m=e[15],y=l*p-c*d,M=o*p-c*u,x=o*d-l*u,T=a*p-c*h,S=a*d-l*h,b=a*u-o*h;return t*(_*y-v*M+m*x)-n*(g*y-v*T+m*S)+s*(g*M-_*T+m*b)-r*(g*x-_*S+v*b)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],_=e[13],v=e[14],m=e[15],y=t*o-n*a,M=t*l-s*a,x=t*c-r*a,T=n*l-s*o,S=n*c-r*o,b=s*c-r*l,w=h*_-u*g,L=h*v-d*g,P=h*m-p*g,F=u*v-d*_,O=u*m-p*_,z=d*m-p*v,D=y*z-M*O+x*F+T*P-S*L+b*w;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let G=1/D;return e[0]=(o*z-l*O+c*F)*G,e[1]=(s*O-n*z-r*F)*G,e[2]=(_*b-v*S+m*T)*G,e[3]=(d*S-u*b-p*T)*G,e[4]=(l*P-a*z-c*L)*G,e[5]=(t*z-s*P+r*L)*G,e[6]=(v*x-g*b-m*M)*G,e[7]=(h*b-d*x+p*M)*G,e[8]=(a*O-o*P+c*w)*G,e[9]=(n*P-t*O-r*w)*G,e[10]=(g*S-_*x+m*y)*G,e[11]=(u*x-h*S-p*y)*G,e[12]=(o*L-a*F-l*w)*G,e[13]=(t*F-n*L+s*w)*G,e[14]=(_*M-g*T-v*y)*G,e[15]=(h*T-u*M+d*y)*G,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,g=r*u,_=a*h,v=a*u,m=o*u,y=l*c,M=l*h,x=l*u,T=n.x,S=n.y,b=n.z;return s[0]=(1-(_+m))*T,s[1]=(p+x)*T,s[2]=(g-M)*T,s[3]=0,s[4]=(p-x)*S,s[5]=(1-(d+m))*S,s[6]=(v+y)*S,s[7]=0,s[8]=(g+M)*b,s[9]=(v-y)*b,s[10]=(1-(d+_))*b,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=la.set(s[0],s[1],s[2]).length(),o=la.set(s[4],s[5],s[6]).length(),l=la.set(s[8],s[9],s[10]).length();r<0&&(a=-a),wi.copy(this);let c=1/a,h=1/o,u=1/l;return wi.elements[0]*=c,wi.elements[1]*=c,wi.elements[2]*=c,wi.elements[4]*=h,wi.elements[5]*=h,wi.elements[6]*=h,wi.elements[8]*=u,wi.elements[9]*=u,wi.elements[10]*=u,t.setFromRotationMatrix(wi),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=li,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),p=(n+s)/(n-s),g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===li)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===er)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=li,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),p=-(n+s)/(n-s),g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===li)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===er)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Wc.prototype.isMatrix4=!0;var ke=Wc,la=new C,wi=new ke,ex=new C(0,0,0),tx=new C(1,1,1),js=new C,Xl=new C,Xn=new C,Bm=new ke,zm=new dt,ps=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:ze("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Bm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Bm,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return zm.setFromEuler(this),this.setFromQuaternion(zm,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ps.DEFAULT_ORDER="XYZ";var Lo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},nx=0,Hm=new C,ca=new dt,as=new ke,jl=new C,vo=new C,ix=new C,sx=new dt,Gm=new C(1,0,0),Vm=new C(0,1,0),Wm=new C(0,0,1),qm={type:"added"},rx={type:"removed"},ha={type:"childadded",child:null},rd={type:"childremoved",child:null},Tt=class i extends Ri{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nx++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new C,t=new ps,n=new dt,s=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ke},normalMatrix:{value:new Ye}}),this.matrix=new ke,this.matrixWorld=new ke,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ca.setFromAxisAngle(e,t),this.quaternion.multiply(ca),this}rotateOnWorldAxis(e,t){return ca.setFromAxisAngle(e,t),this.quaternion.premultiply(ca),this}rotateX(e){return this.rotateOnAxis(Gm,e)}rotateY(e){return this.rotateOnAxis(Vm,e)}rotateZ(e){return this.rotateOnAxis(Wm,e)}translateOnAxis(e,t){return Hm.copy(e).applyQuaternion(this.quaternion),this.position.add(Hm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Gm,e)}translateY(e){return this.translateOnAxis(Vm,e)}translateZ(e){return this.translateOnAxis(Wm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(as.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?jl.copy(e):jl.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),vo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?as.lookAt(vo,jl,this.up):as.lookAt(jl,vo,this.up),this.quaternion.setFromRotationMatrix(as),s&&(as.extractRotation(s.matrixWorld),ca.setFromRotationMatrix(as),this.quaternion.premultiply(ca.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(qm),ha.child=e,this.dispatchEvent(ha),ha.child=null):Ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(rx),rd.child=e,this.dispatchEvent(rd),rd.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),as.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),as.multiply(e.parent.matrixWorld)),e.applyMatrix4(as),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(qm),ha.child=e,this.dispatchEvent(ha),ha.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vo,e,ix),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vo,sx,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Tt.DEFAULT_UP=new C(0,1,0);Tt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xt=class extends Tt{constructor(){super(),this.isGroup=!0,this.type="Group"}},ax={type:"move"},Ra=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let v=t.getJointPose(_,n),m=this._getHandJoint(c,_);v!==null&&(m.matrix.fromArray(v.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=v.radius),m.visible=v!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ax)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Xt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},s0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ks={h:0,s:0,l:0},Kl={h:0,s:0,l:0};function ad(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ee=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ht){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=ct.workingColorSpace){if(e=of(e,1),t=ut(t,0,1),n=ut(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ad(a,r,e+1/3),this.g=ad(a,r,e),this.b=ad(a,r,e-1/3)}return ct.colorSpaceToWorking(this,s),this}setStyle(e,t=Ht){function n(r){r!==void 0&&parseFloat(r)<1&&ze("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ze("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);ze("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ht){let n=s0[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ze("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ds(e.r),this.g=ds(e.g),this.b=ds(e.b),this}copyLinearToSRGB(e){return this.r=_a(e.r),this.g=_a(e.g),this.b=_a(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ht){return ct.workingToColorSpace(yn.copy(this),e),Math.round(ut(yn.r*255,0,255))*65536+Math.round(ut(yn.g*255,0,255))*256+Math.round(ut(yn.b*255,0,255))}getHexString(e=Ht){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.workingToColorSpace(yn.copy(this),t);let n=yn.r,s=yn.g,r=yn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ct.workingColorSpace){return ct.workingToColorSpace(yn.copy(this),t),e.r=yn.r,e.g=yn.g,e.b=yn.b,e}getStyle(e=Ht){ct.workingToColorSpace(yn.copy(this),e);let t=yn.r,n=yn.g,s=yn.b;return e!==Ht?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ks),this.setHSL(Ks.h+e,Ks.s+t,Ks.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ks),e.getHSL(Kl);let n=Ao(Ks.h,Kl.h,t),s=Ao(Ks.s,Kl.s,t),r=Ao(Ks.l,Kl.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},yn=new Ee;Ee.NAMES=s0;var Do=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ee(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Ca=class extends Tt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ps,this.environmentIntensity=1,this.environmentRotation=new ps,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ti=new C,os=new C,od=new C,ls=new C,ua=new C,da=new C,Xm=new C,ld=new C,cd=new C,hd=new C,ud=new xt,dd=new xt,fd=new xt,Qs=class i{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Ti.subVectors(e,t),s.cross(Ti);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Ti.subVectors(s,t),os.subVectors(n,t),od.subVectors(e,t);let a=Ti.dot(Ti),o=Ti.dot(os),l=Ti.dot(od),c=os.dot(os),h=os.dot(od),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ls)===null?!1:ls.x>=0&&ls.y>=0&&ls.x+ls.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,ls)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ls.x),l.addScaledVector(a,ls.y),l.addScaledVector(o,ls.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return ud.setScalar(0),dd.setScalar(0),fd.setScalar(0),ud.fromBufferAttribute(e,t),dd.fromBufferAttribute(e,n),fd.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ud,r.x),a.addScaledVector(dd,r.y),a.addScaledVector(fd,r.z),a}static isFrontFacing(e,t,n,s){return Ti.subVectors(n,t),os.subVectors(e,t),Ti.cross(os).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ti.subVectors(this.c,this.b),os.subVectors(this.a,this.b),Ti.cross(os).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;ua.subVectors(s,n),da.subVectors(r,n),ld.subVectors(e,n);let l=ua.dot(ld),c=da.dot(ld);if(l<=0&&c<=0)return t.copy(n);cd.subVectors(e,s);let h=ua.dot(cd),u=da.dot(cd);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0&&l-h>0)return a=l/(l-h),t.copy(n).addScaledVector(ua,a);hd.subVectors(e,r);let p=ua.dot(hd),g=da.dot(hd);if(g>=0&&p<=g)return t.copy(r);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(da,o);let v=h*g-p*u;if(v<=0&&u-h>=0&&p-g>=0)return Xm.subVectors(r,s),o=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(Xm,o);let m=1/(v+_+d);return a=_*m,o=d*m,t.copy(n).addScaledVector(ua,a).addScaledVector(da,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Kn=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Ei.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Ei.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Ei.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Ei):Ei.fromBufferAttribute(r,a),Ei.applyMatrix4(e.matrixWorld),this.expandByPoint(Ei);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Yl.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Yl.copy(n.boundingBox)),Yl.applyMatrix4(e.matrixWorld),this.union(Yl)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ei),Ei.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(bo),Jl.subVectors(this.max,bo),fa.subVectors(e.a,bo),pa.subVectors(e.b,bo),ma.subVectors(e.c,bo),Ys.subVectors(pa,fa),Js.subVectors(ma,pa),Sr.subVectors(fa,ma);let t=[0,-Ys.z,Ys.y,0,-Js.z,Js.y,0,-Sr.z,Sr.y,Ys.z,0,-Ys.x,Js.z,0,-Js.x,Sr.z,0,-Sr.x,-Ys.y,Ys.x,0,-Js.y,Js.x,0,-Sr.y,Sr.x,0];return!pd(t,fa,pa,ma,Jl)||(t=[1,0,0,0,1,0,0,0,1],!pd(t,fa,pa,ma,Jl))?!1:($l.crossVectors(Ys,Js),t=[$l.x,$l.y,$l.z],pd(t,fa,pa,ma,Jl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ei).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ei).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(cs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),cs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),cs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),cs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),cs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),cs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),cs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),cs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(cs),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},cs=[new C,new C,new C,new C,new C,new C,new C,new C],Ei=new C,Yl=new Kn,fa=new C,pa=new C,ma=new C,Ys=new C,Js=new C,Sr=new C,bo=new C,Jl=new C,$l=new C,wr=new C;function pd(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){wr.fromArray(i,r);let o=s.x*Math.abs(wr.x)+s.y*Math.abs(wr.y)+s.z*Math.abs(wr.z),l=e.dot(wr),c=t.dot(wr),h=n.dot(wr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Qt=new C,Zl=new He,ox=0,nt=class extends Ri{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ox++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=rf,this.updateRanges=[],this.gpuType=Jn,this.version=0,this._normalizationScale=e!==void 0?Nh(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Zl.fromBufferAttribute(this,t),Zl.applyMatrix3(e),this.setXY(t,Zl.x,Zl.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix3(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix4(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyNormalMatrix(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.transformDirection(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):cf(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):hf(e,this.array)}};var Fo=class extends nt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var No=class extends nt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Dt=class extends nt{constructor(e,t,n){super(new Float32Array(e),t,n)}},lx=new Kn,xo=new C,md=new C,_n=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):lx.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;xo.subVectors(e,this.center);let t=xo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(xo,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(md.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(xo.copy(e.center).add(md)),this.expandByPoint(xo.copy(e.center).sub(md))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},cx=0,ai=new ke,gd=new Tt,ga=new C,jn=new Kn,yo=new Kn,fn=new C,Ct=class i extends Ri{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:cx++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Fb(e)?No:Fo)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,n){return ai.makeTranslation(e,t,n),this.applyMatrix4(ai),this}scale(e,t,n){return ai.makeScale(e,t,n),this.applyMatrix4(ai),this}lookAt(e){return gd.lookAt(e),gd.updateMatrix(),this.applyMatrix4(gd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ga).negate(),this.translate(ga.x,ga.y,ga.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Dt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&ze("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Kn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];jn.setFromBufferAttribute(r),this.morphTargetsRelative?(fn.addVectors(this.boundingBox.min,jn.min),this.boundingBox.expandByPoint(fn),fn.addVectors(this.boundingBox.max,jn.max),this.boundingBox.expandByPoint(fn)):(this.boundingBox.expandByPoint(jn.min),this.boundingBox.expandByPoint(jn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _n);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let n=this.boundingSphere.center;if(jn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];yo.setFromBufferAttribute(o),this.morphTargetsRelative?(fn.addVectors(jn.min,yo.min),jn.expandByPoint(fn),fn.addVectors(jn.max,yo.max),jn.expandByPoint(fn)):(jn.expandByPoint(yo.min),jn.expandByPoint(yo.max))}jn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)fn.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(fn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)fn.fromBufferAttribute(o,c),l&&(ga.fromBufferAttribute(e,c),fn.add(ga)),s=Math.max(s,n.distanceToSquared(fn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new nt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let L=0;L<n.count;L++)o[L]=new C,l[L]=new C;let h=new C,u=new C,d=new C,p=new He,g=new He,_=new He,v=new C,m=new C;function y(L,P,F){c[L]=c[P]=c[F]=1,h.fromBufferAttribute(n,L),u.fromBufferAttribute(n,P),d.fromBufferAttribute(n,F),p.fromBufferAttribute(r,L),g.fromBufferAttribute(r,P),_.fromBufferAttribute(r,F),u.sub(h),d.sub(h),g.sub(p),_.sub(p);let O=1/(g.x*_.y-_.x*g.y);isFinite(O)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(d,-g.y).multiplyScalar(O),m.copy(d).multiplyScalar(g.x).addScaledVector(u,-_.x).multiplyScalar(O),o[L].add(v),o[P].add(v),o[F].add(v),l[L].add(m),l[P].add(m),l[F].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let L=0,P=M.length;L<P;++L){let F=M[L],O=F.start,z=F.count;for(let D=O,G=O+z;D<G;D+=3)y(e.getX(D+0),e.getX(D+1),e.getX(D+2))}let x=new C,T=new C,S=new C,b=new C;function w(L){S.fromBufferAttribute(s,L),b.copy(S);let P=o[L];x.copy(P),x.sub(S.multiplyScalar(S.dot(P))).normalize(),T.crossVectors(b,P);let O=T.dot(l[L])<0?-1:1;a.setXYZW(L,x.x,x.y,x.z,O)}for(let L=0,P=n.count;L<P;++L)c[L]&&w(L);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new nt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,h=new C,u=new C;if(e)for(let d=0,p=e.count;d<p;d+=3){let g=e.getX(d+0),_=e.getX(d+1),v=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,v),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,v),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(v,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)fn.fromBufferAttribute(e,t),fn.normalize(),e.setXYZ(t,fn.x,fn.y,fn.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),p=0,g=0;for(let _=0,v=l.length;_<v;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let m=0;m<h;m++)d[g++]=c[p++]}return new nt(d,h,u)}if(this.index===null)return ze("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Pa=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=rf,this.updateRanges=[],this.version=0,this.uuid=ji()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=jm(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=jm(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function jm(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=ji()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var Ln=new C,Ia=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?Nh(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ln.fromBufferAttribute(this,t),Ln.applyMatrix4(e),this.setXYZ(t,Ln.x,Ln.y,Ln.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ln.fromBufferAttribute(this,t),Ln.applyNormalMatrix(e),this.setXYZ(t,Ln.x,Ln.y,Ln.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ln.fromBufferAttribute(this,t),Ln.transformDirection(e),this.setXYZ(t,Ln.x,Ln.y,Ln.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Po("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new nt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Po("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):cf(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):hf(e,this.data.array)}},vd=new C,hx=new C,ux=new Ye,Ai=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=vd.subVectors(n,t).cross(hx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(vd),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ux.getNormalMatrix(e),s=this.coplanarPoint(vd).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},dx=0,kn=class extends Ri{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dx++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=Ts,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Od,this.blendDst=kd,this.blendEquation=Hr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ee(0,0,0),this.blendAlpha=0,this.depthFunc=Ma,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Kg,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=bc,this.stencilZFail=bc,this.stencilZPass=bc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ze(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ze(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ee().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Ai().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new He().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new He().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var hs=new C,bd=new C,Ql=new C,ec=new C,Dr=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,hs)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=hs.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(hs.copy(this.origin).addScaledVector(this.direction,t),hs.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){bd.copy(e).add(t).multiplyScalar(.5),Ql.copy(t).sub(e).normalize(),ec.copy(this.origin).sub(bd);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Ql),o=ec.dot(this.direction),l=-ec.dot(Ql),c=ec.lengthSq(),h=Math.abs(1-a*a),u,d,p,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(bd).addScaledVector(Ql,d),p}intersectSphere(e,t){if(e.radius<0)return null;hs.subVectors(e.center,this.origin);let n=hs.dot(this.direction),s=hs.dot(hs)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,hs)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=e.x-a.x,d=e.y-a.y,p=e.z-a.z,g=t.x-a.x,_=t.y-a.y,v=t.z-a.z,m=n.x-a.x,y=n.y-a.y,M=n.z-a.z,x=Math.abs(l),T=Math.abs(c),S=Math.abs(h),b,w,L,P,F,O,z,D,G,X,H,ie;if(x>=T&&x>=S?(L=l,O=u,G=g,ie=m,l>=0?(b=c,w=h,P=d,F=p,z=_,D=v,X=y,H=M):(b=h,w=c,P=p,F=d,z=v,D=_,X=M,H=y)):T>=S?(L=c,O=d,G=_,ie=y,c>=0?(b=h,w=l,P=p,F=u,z=v,D=g,X=M,H=m):(b=l,w=h,P=u,F=p,z=g,D=v,X=m,H=M)):(L=h,O=p,G=v,ie=M,h>=0?(b=l,w=c,P=u,F=d,z=g,D=_,X=m,H=y):(b=c,w=l,P=d,F=u,z=_,D=g,X=y,H=m)),L===0)return null;let j=b/L,K=w/L,$=1/L,ae=P-j*O,he=F-K*O,Y=z-j*G,re=D-K*G,ve=X-j*ie,Ie=H-K*ie,le=ve*re-Ie*Y,qe=ae*Ie-he*ve,bt=Y*he-re*ae;if(s){if(le<0||qe<0||bt<0)return null}else if((le<0||qe<0||bt<0)&&(le>0||qe>0||bt>0))return null;let Oe=le+qe+bt;if(Oe===0)return null;let et=$*(le*O+qe*G+bt*ie);return(Oe>0?et<0:et>0)?null:this.at(et/Oe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},pn=class extends kn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ps,this.combine=Bd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Km=new ke,Tr=new Dr,tc=new _n,Ym=new C,nc=new C,ic=new C,sc=new C,xd=new C,rc=new C,Jm=new C,ac=new C,Et=class extends Tt{constructor(e=new Ct,t=new pn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){rc.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(xd.fromBufferAttribute(u,e),a?rc.addScaledVector(xd,h):rc.addScaledVector(xd.sub(t),h))}t.add(rc)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),tc.copy(n.boundingSphere),tc.applyMatrix4(r),Tr.copy(e.ray).recast(e.near),!(tc.containsPoint(Tr.origin)===!1&&(Tr.intersectSphere(tc,Ym)===null||Tr.origin.distanceToSquared(Ym)>(e.far-e.near)**2))&&(Km.copy(r).invert(),Tr.copy(e.ray).applyMatrix4(Km),!(n.boundingBox!==null&&Tr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Tr)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let v=d[g],m=a[v.materialIndex],y=Math.max(v.start,p.start),M=Math.min(o.count,Math.min(v.start+v.count,p.start+p.count));for(let x=y,T=M;x<T;x+=3){let S=o.getX(x),b=o.getX(x+1),w=o.getX(x+2);s=oc(this,m,e,n,c,h,u,S,b,w),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let v=g,m=_;v<m;v+=3){let y=o.getX(v),M=o.getX(v+1),x=o.getX(v+2);s=oc(this,a,e,n,c,h,u,y,M,x),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let v=d[g],m=a[v.materialIndex],y=Math.max(v.start,p.start),M=Math.min(l.count,Math.min(v.start+v.count,p.start+p.count));for(let x=y,T=M;x<T;x+=3){let S=x,b=x+1,w=x+2;s=oc(this,m,e,n,c,h,u,S,b,w),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let v=g,m=_;v<m;v+=3){let y=v,M=v+1,x=v+2;s=oc(this,a,e,n,c,h,u,y,M,x),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}}};function fx(i,e,t,n,s,r,a,o){let l;if(e.side===an?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Xi,o),l===null)return null;ac.copy(o),ac.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(ac);return c<t.near||c>t.far?null:{distance:c,point:ac.clone(),object:i}}function oc(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,nc),i.getVertexPosition(l,ic),i.getVertexPosition(c,sc);let h=fx(i,e,t,n,nc,ic,sc,Jm);if(h){let u=new C;Qs.getBarycoord(Jm,nc,ic,sc,u),s&&(h.uv=Qs.getInterpolatedAttribute(s,o,l,c,u,new He)),r&&(h.uv1=Qs.getInterpolatedAttribute(r,o,l,c,u,new He)),a&&(h.normal=Qs.getInterpolatedAttribute(a,o,l,c,u,new C),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new C,materialIndex:0};Qs.getNormal(nc,ic,sc,d.normal),h.face=d,h.barycoord=u}return h}var _o=new xt,$m=new xt,Zm=new xt,px=new xt,Qm=new ke,lc=new C,yd=new _n,eg=new ke,_d=new Dr,Fr=class extends Et{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Td,this.bindMatrix=new ke,this.bindMatrixInverse=new ke,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Kn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,lc),this.boundingBox.expandByPoint(lc)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new _n),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,lc),this.boundingSphere.expandByPoint(lc)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),yd.copy(this.boundingSphere),yd.applyMatrix4(s),e.ray.intersectsSphere(yd)!==!1&&(eg.copy(s).invert(),_d.copy(e.ray).applyMatrix4(eg),!(this.boundingBox!==null&&_d.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,_d)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new xt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Td?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Gg?this.bindMatrixInverse.copy(this.bindMatrix).invert():ze("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;$m.fromBufferAttribute(s.attributes.skinIndex,e),Zm.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(_o.copy(t),t.set(0,0,0,0)):(_o.set(t.x,t.y,t.z,1),t.set(0,0,0)),_o.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Zm.getComponent(r);if(a!==0){let o=$m.getComponent(r);Qm.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(px.copy(_o).applyMatrix4(Qm),a)}}return t.isVector4&&(t.w=_o.w),t.applyMatrix4(this.bindMatrixInverse)}},La=class extends Tt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Da=class extends rn{constructor(e=null,t=1,n=1,s,r,a,o,l,c=jt,h=jt,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},tg=new ke,mx=new ke,Uo=class i{constructor(e=[],t=[]){this.uuid=ji(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){ze("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new ke)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new ke;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:mx;tg.multiplyMatrices(o,t[r]),tg.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Da(t,e,e,zn,Jn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(ze("Skeleton: No bone found with UUID:",r),a=new La),this.bones.push(a),this.boneInverses.push(new ke().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},ci=class extends nt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},va=new ke,ng=new ke,cc=[],ig=new Kn,gx=new ke,Mo=new Et,So=new _n,ms=class extends Et{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ci(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,gx)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Kn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,va),ig.copy(e.boundingBox).applyMatrix4(va),this.boundingBox.union(ig)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new _n),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,va),So.copy(e.boundingSphere).applyMatrix4(va),this.boundingSphere.union(So)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Mo.geometry=this.geometry,Mo.material=this.material,Mo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),So.copy(this.boundingSphere),So.applyMatrix4(n),e.ray.intersectsSphere(So)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,va),ng.multiplyMatrices(n,va),Mo.matrixWorld=ng,Mo.raycast(e,cc);for(let a=0,o=cc.length;a<o;a++){let l=cc[a];l.instanceId=r,l.object=this,t.push(l)}cc.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ci(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Da(new Float32Array(s*this.count),s,this.count,Zc,Jn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Er=new _n,vx=new He(.5,.5),hc=new C,Vi=class{constructor(e=new Ai,t=new Ai,n=new Ai,s=new Ai,r=new Ai,a=new Ai){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=li,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],p=r[7],g=r[8],_=r[9],v=r[10],m=r[11],y=r[12],M=r[13],x=r[14],T=r[15];if(s[0].setComponents(c-a,p-h,m-g,T-y).normalize(),s[1].setComponents(c+a,p+h,m+g,T+y).normalize(),s[2].setComponents(c+o,p+u,m+_,T+M).normalize(),s[3].setComponents(c-o,p-u,m-_,T-M).normalize(),n)s[4].setComponents(l,d,v,x).normalize(),s[5].setComponents(c-l,p-d,m-v,T-x).normalize();else if(s[4].setComponents(c-l,p-d,m-v,T-x).normalize(),t===li)s[5].setComponents(c+l,p+d,m+v,T+x).normalize();else if(t===er)s[5].setComponents(l,d,v,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Er.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Er.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Er)}intersectsSprite(e){Er.center.set(0,0,0);let t=vx.distanceTo(e.center);return Er.radius=.7071067811865476+t,Er.applyMatrix4(e.matrixWorld),this.intersectsSphere(Er)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(hc.x=s.normal.x>0?e.max.x:e.min.x,hc.y=s.normal.y>0?e.max.y:e.min.y,hc.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(hc)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},sg=new ke,Rc=class i{constructor(){this.coordinateSystem=li,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];sg.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Vi),n[s].setFromProjectionMatrix(sg,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Vi),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var Fa=class extends kn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Cc=new C,Pc=new C,rg=new ke,wo=new Dr,uc=new _n,Md=new C,ag=new C,Nr=class extends Tt{constructor(e=new Ct,t=new Fa){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Cc.fromBufferAttribute(t,s-1),Pc.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Cc.distanceTo(Pc);e.setAttribute("lineDistance",new Dt(n,1))}else ze("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),uc.copy(n.boundingSphere),uc.applyMatrix4(s),uc.radius+=r,e.ray.intersectsSphere(uc)===!1)return;rg.copy(s).invert(),wo.copy(e.ray).applyMatrix4(rg);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=p,v=g-1;_<v;_+=c){let m=h.getX(_),y=h.getX(_+1),M=dc(this,e,wo,l,m,y,_);M&&t.push(M)}if(this.isLineLoop){let _=h.getX(g-1),v=h.getX(p),m=dc(this,e,wo,l,_,v,g-1);m&&t.push(m)}}else{let p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=p,v=g-1;_<v;_+=c){let m=dc(this,e,wo,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=dc(this,e,wo,l,g-1,p,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function dc(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(Cc.fromBufferAttribute(o,s),Pc.fromBufferAttribute(o,r),t.distanceSqToSegment(Cc,Pc,Md,ag)>n)return;Md.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Md);if(!(c<e.near||c>e.far))return{distance:c,point:ag.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var og=new C,lg=new C,Oo=class extends Nr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)og.fromBufferAttribute(t,s),lg.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+og.distanceTo(lg);e.setAttribute("lineDistance",new Dt(n,1))}else ze("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},ko=class extends Nr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Na=class extends kn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},cg=new ke,Ad=new Dr,fc=new _n,pc=new C,tr=class extends Tt{constructor(e=new Ct,t=new Na){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fc.copy(n.boundingSphere),fc.applyMatrix4(s),fc.radius+=r,e.ray.intersectsSphere(fc)===!1)return;cg.copy(s).invert(),Ad.copy(e.ray).applyMatrix4(cg);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=d,_=p;g<_;g++){let v=c.getX(g);pc.fromBufferAttribute(u,v),hg(pc,v,l,s,e,t,this)}}else{let d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=d,_=p;g<_;g++)pc.fromBufferAttribute(u,g),hg(pc,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function hg(i,e,t,n,s,r,a){let o=Ad.distanceSqToPoint(i);if(o<t){let l=new C;Ad.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Ur=class extends rn{constructor(e=[],t=Gr,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ua=class extends rn{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var gs=class extends rn{constructor(e,t,n=Ci,s,r,a,o=jt,l=jt,c,h=fs,u=1){if(h!==fs&&h!==Es)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ea(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Bo=class extends gs{constructor(e,t=Ci,n=Gr,s,r,a=jt,o=jt,l,c=fs){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},zo=class extends rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Oa=class i extends Ct{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Dt(c,3)),this.setAttribute("normal",new Dt(h,3)),this.setAttribute("uv",new Dt(u,2));function g(_,v,m,y,M,x,T,S,b,w,L){let P=x/b,F=T/w,O=x/2,z=T/2,D=S/2,G=b+1,X=w+1,H=0,ie=0,j=new C;for(let K=0;K<X;K++){let $=K*F-z;for(let ae=0;ae<G;ae++){let he=ae*P-O;j[_]=he*y,j[v]=$*M,j[m]=D,c.push(j.x,j.y,j.z),j[_]=0,j[v]=0,j[m]=S>0?1:-1,h.push(j.x,j.y,j.z),u.push(ae/b),u.push(1-K/w),H+=1}}for(let K=0;K<w;K++)for(let $=0;$<b;$++){let ae=d+$+G*K,he=d+$+G*(K+1),Y=d+($+1)+G*(K+1),re=d+($+1)+G*K;l.push(ae,he,re),l.push(he,Y,re),ie+=6}o.addGroup(p,ie,L),p+=ie,d+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ho=class i extends Ct{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],g=0,_=[],v=n/2,m=0;y(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Dt(u,3)),this.setAttribute("normal",new Dt(d,3)),this.setAttribute("uv",new Dt(p,2));function y(){let x=new C,T=new C,S=0,b=(t-e)/n;for(let w=0;w<=r;w++){let L=[],P=w/r,F=P*(t-e)+e;for(let O=0;O<=s;O++){let z=O/s,D=z*l+o,G=Math.sin(D),X=Math.cos(D);T.x=F*G,T.y=-P*n+v,T.z=F*X,u.push(T.x,T.y,T.z),x.set(G,b,X).normalize(),d.push(x.x,x.y,x.z),p.push(z,1-P),L.push(g++)}_.push(L)}for(let w=0;w<s;w++)for(let L=0;L<r;L++){let P=_[L][w],F=_[L+1][w],O=_[L+1][w+1],z=_[L][w+1];(e>0||L!==0)&&(h.push(P,F,z),S+=3),(t>0||L!==r-1)&&(h.push(F,O,z),S+=3)}c.addGroup(m,S,0),m+=S}function M(x){let T=g,S=new He,b=new C,w=0,L=x===!0?e:t,P=x===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,v*P,0),d.push(0,P,0),p.push(.5,.5),g++;let F=g;for(let O=0;O<=s;O++){let D=O/s*l+o,G=Math.cos(D),X=Math.sin(D);b.x=L*X,b.y=v*P,b.z=L*G,u.push(b.x,b.y,b.z),d.push(0,P,0),S.x=G*.5+.5,S.y=X*.5*P+.5,p.push(S.x,S.y),g++}for(let O=0;O<s;O++){let z=T+O,D=F+O;x===!0?h.push(D,D+1,z):h.push(D+1,D,z),w+=3}c.addGroup(m,w,x===!0?1:2),m+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Ic=class i extends Ct{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new Dt(r,3)),this.setAttribute("normal",new Dt(r.slice(),3)),this.setAttribute("uv",new Dt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let M=new C,x=new C,T=new C;for(let S=0;S<t.length;S+=3)p(t[S+0],M),p(t[S+1],x),p(t[S+2],T),l(M,x,T,y)}function l(y,M,x,T){let S=T+1,b=[];for(let w=0;w<=S;w++){b[w]=[];let L=y.clone().lerp(x,w/S),P=M.clone().lerp(x,w/S),F=S-w;for(let O=0;O<=F;O++)O===0&&w===S?b[w][O]=L:b[w][O]=L.clone().lerp(P,O/F)}for(let w=0;w<S;w++)for(let L=0;L<2*(S-w)-1;L++){let P=Math.floor(L/2);L%2===0?(d(b[w][P+1]),d(b[w+1][P]),d(b[w][P])):(d(b[w][P+1]),d(b[w+1][P+1]),d(b[w+1][P]))}}function c(y){let M=new C;for(let x=0;x<r.length;x+=3)M.x=r[x+0],M.y=r[x+1],M.z=r[x+2],M.normalize().multiplyScalar(y),r[x+0]=M.x,r[x+1]=M.y,r[x+2]=M.z}function h(){let y=new C;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];let x=v(y)/2/Math.PI+.5,T=m(y)/Math.PI+.5;a.push(x,1-T)}g(),u()}function u(){for(let y=0;y<a.length;y+=6){let M=a[y+0],x=a[y+2],T=a[y+4],S=Math.max(M,x,T),b=Math.min(M,x,T);S>.9&&b<.1&&(M<.2&&(a[y+0]+=1),x<.2&&(a[y+2]+=1),T<.2&&(a[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function p(y,M){let x=y*3;M.x=e[x+0],M.y=e[x+1],M.z=e[x+2]}function g(){let y=new C,M=new C,x=new C,T=new C,S=new He,b=new He,w=new He;for(let L=0,P=0;L<r.length;L+=9,P+=6){y.set(r[L+0],r[L+1],r[L+2]),M.set(r[L+3],r[L+4],r[L+5]),x.set(r[L+6],r[L+7],r[L+8]),S.set(a[P+0],a[P+1]),b.set(a[P+2],a[P+3]),w.set(a[P+4],a[P+5]),T.copy(y).add(M).add(x).divideScalar(3);let F=v(T);_(S,P+0,y,F),_(b,P+2,M,F),_(w,P+4,x,F)}}function _(y,M,x,T){T<0&&y.x===1&&(a[M]=y.x-1),x.x===0&&x.z===0&&(a[M]=T/2/Math.PI+.5)}function v(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}};var Go=class i extends Ic{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var Or=class i extends Ct{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,p=[],g=[],_=[],v=[];for(let m=0;m<h;m++){let y=m*d-a;for(let M=0;M<c;M++){let x=M*u-r;g.push(x,-y,0),_.push(0,0,1),v.push(M/o),v.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<o;y++){let M=y+c*m,x=y+c*(m+1),T=y+1+c*(m+1),S=y+1+c*m;p.push(M,x,S),p.push(x,T,S)}this.setIndex(p),this.setAttribute("position",new Dt(g,3)),this.setAttribute("normal",new Dt(_,3)),this.setAttribute("uv",new Dt(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var kr=class i extends Ct{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new C,d=new C,p=[],g=[],_=[],v=[];for(let m=0;m<=n;m++){let y=[],M=m/n,x=a+M*o,T=e*Math.cos(x),S=Math.sqrt(e*e-T*T),b=0;m===0&&a===0?b=.5/t:m===n&&l===Math.PI&&(b=-.5/t);for(let w=0;w<=t;w++){let L=w/t,P=s+L*r;u.x=-S*Math.cos(P),u.y=T,u.z=S*Math.sin(P),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),v.push(L+b,1-M),y.push(c++)}h.push(y)}for(let m=0;m<n;m++)for(let y=0;y<t;y++){let M=h[m][y+1],x=h[m][y],T=h[m+1][y],S=h[m+1][y+1];(m!==0||a>0)&&p.push(M,x,S),(m!==n-1||l<Math.PI)&&p.push(x,T,S)}this.setIndex(p),this.setAttribute("position",new Dt(g,3)),this.setAttribute("normal",new Dt(_,3)),this.setAttribute("uv",new Dt(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function qr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(ug(s))s.isRenderTargetTexture?(ze("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(ug(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Tn(i){let e={};for(let t=0;t<i.length;t++){let n=qr(i[t]);for(let s in n)e[s]=n[s]}return e}function ug(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function bx(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function uf(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}var Xr={clone:qr,merge:Tn},xx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ut=class extends kn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xx,this.fragmentShader=yx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=qr(e.uniforms),this.uniformsGroups=bx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ee().setHex(s.value);break;case"v2":this.uniforms[n].value=new He().fromArray(s.value);break;case"v3":this.uniforms[n].value=new C().fromArray(s.value);break;case"v4":this.uniforms[n].value=new xt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ye().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ke().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Lc=class extends Ut{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Yn=class extends kn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ee(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Fh,this.normalScale=new He(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ps,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Fn=class extends Yn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new He(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ut(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Ee(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ee(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ee(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Cr('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Cr('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Dc=class extends kn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Xg,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Fc=class extends kn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Zs(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function To(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function _x(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function dg(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function Mx(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var Wi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break t}a=t.length;break n}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Nc=class extends Wi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ar,endingEnd:Ar}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Rr:r=e,o=2*t-n;break;case Ro:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Rr:a=e,l=2*n-t;break;case Ro:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),_=g*g,v=_*g,m=-d*v+2*d*_-d*g,y=(1+d)*v+(-1.5-2*d)*_+(-.5+d)*g+1,M=(-1-p)*v+(1.5+p)*_+.5*g,x=p*v-p*_;for(let T=0;T!==o;++T)r[T]=m*a[h+T]+y*a[c+T]+M*a[l+T]+x*a[u+T];return r}},Vo=class extends Wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},Uc=class extends Wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Oc=class extends Wi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-t)/(s-t),_=1-g;for(let v=0;v!==o;++v)r[v]=a[c+v]*_+a[l+v]*g;return r}let d=o*2,p=e-1;for(let g=0;g!==o;++g){let _=a[c+g],v=a[l+g],m=p*d+g*2,y=u[m],M=u[m+1],x=e*d+g*2,T=h[x],S=h[x+1],b=wx(n,t,y,T,s);r[g]=r0(b,_,M,S,v)}return r}};function r0(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Sx(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function wx(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=r0(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Sx(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Bn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Zs(t,this.TimeBufferType),this.values=Zs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Zs(e.times,Array),values:Zs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),To(e.settings)&&(n.settings={inTangents:Zs(e.settings.inTangents,Array),outTangents:Zs(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Uc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Vo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Nc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Oc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Pr:t=this.InterpolantFactoryMethodDiscrete;break;case Ir:t=this.InterpolantFactoryMethodLinear;break;case vc:t=this.InterpolantFactoryMethodSmooth;break;case Ed:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ze("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pr;case this.InterpolantFactoryMethodLinear:return Ir;case this.InterpolantFactoryMethodSmooth:return vc;case this.InterpolantFactoryMethodBezier:return Ed}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;To(this.settings)&&(fg(this.settings.inTangents,e),fg(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;To(this.settings)&&(pg(this.settings.inTangents,e),pg(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ke("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Nb(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===vc,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*n,d=u-n,p=u+n;for(let g=0;g!==n;++g){let _=t[u+g];if(_!==t[d+g]||_!==t[p+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*n,d=a*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,To(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function fg(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function pg(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Bn.prototype.ValueTypeName="";Bn.prototype.TimeBufferType=Float32Array;Bn.prototype.ValueBufferType=Float32Array;Bn.prototype.DefaultInterpolation=Ir;var vs=class extends Bn{constructor(e,t,n){super(e,t,n)}};vs.prototype.ValueTypeName="bool";vs.prototype.ValueBufferType=Array;vs.prototype.DefaultInterpolation=Pr;vs.prototype.InterpolantFactoryMethodLinear=void 0;vs.prototype.InterpolantFactoryMethodSmooth=void 0;var Wo=class extends Bn{constructor(e,t,n,s){super(e,t,n,s)}};Wo.prototype.ValueTypeName="color";var bs=class extends Bn{constructor(e,t,n,s){super(e,t,n,s)}};bs.prototype.ValueTypeName="number";var kc=class extends Wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)dt.slerpFlat(r,0,a,c-o,a,c,l);return r}},xs=class extends Bn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new kc(this.times,this.values,this.getValueSize(),e)}};xs.prototype.ValueTypeName="quaternion";xs.prototype.InterpolantFactoryMethodSmooth=void 0;var ys=class extends Bn{constructor(e,t,n){super(e,t,n)}};ys.prototype.ValueTypeName="string";ys.prototype.ValueBufferType=Array;ys.prototype.DefaultInterpolation=Pr;ys.prototype.InterpolantFactoryMethodLinear=void 0;ys.prototype.InterpolantFactoryMethodSmooth=void 0;var nr=class extends Bn{constructor(e,t,n,s){super(e,t,n,s)}};nr.prototype.ValueTypeName="vector";var Br=class{constructor(e="",t=-1,n=[],s=Dh){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=ji(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Ex(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Bn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let h=_x(l);l=dg(l,1,h),c=dg(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new bs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],h=c.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Tx(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return bs;case"vector":case"vector2":case"vector3":case"vector4":return nr;case"color":return Wo;case"quaternion":return xs;case"bool":case"boolean":return vs;case"string":return ys}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Ex(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Tx(i.type);if(i.times===void 0){let n=[],s=[];Mx(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),To(i.settings)&&(t.settings={inTangents:Zs(i.settings.inTangents,Float32Array),outTangents:Zs(i.settings.outTangents,Float32Array)}),t}var Hi={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(mg(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!mg(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function mg(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Bc=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},a0=new Bc,qi=class{constructor(e){this.manager=e!==void 0?e:a0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};qi.DEFAULT_MATERIAL_NAME="__DEFAULT";var us={},Rd=class extends Error{constructor(e,t){super(e),this.response=t}},ka=class extends qi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Hi.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(us[e]!==void 0){us[e].push({onLoad:t,onProgress:n,onError:s});return}us[e]=[],us[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&ze("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=us[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),p=d?parseInt(d):0,g=p!==0,_=0,v=new ReadableStream({start(m){y();function y(){u.read().then(({done:M,value:x})=>{if(M)m.close();else{_+=x.byteLength;let T=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:p});for(let S=0,b=h.length;S<b;S++){let w=h[S];w.onProgress&&w.onProgress(T)}m.enqueue(x),y()}},M=>{m.error(M)})}}});return new Response(v)}else throw new Rd(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,p=new TextDecoder(d);return c.arrayBuffer().then(g=>p.decode(g))}}}).then(c=>{Hi.add(`file:${e}`,c);let h=us[e];delete us[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onLoad&&p.onLoad(c)}}).catch(c=>{let h=us[e];if(h===void 0)throw this.manager.itemError(e),c;delete us[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onError&&p.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var ba=new WeakMap,zc=class extends qi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Hi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=ba.get(a);u===void 0&&(u=[],ba.set(a,u)),u.push({onLoad:t,onError:s})}return a}let o=wa("img");function l(){h(),t&&t(this);let u=ba.get(this)||[];for(let d=0;d<u.length;d++){let p=u[d];p.onLoad&&p.onLoad(this)}ba.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),Hi.remove(`image:${e}`);let d=ba.get(this)||[];for(let p=0;p<d.length;p++){let g=d[p];g.onError&&g.onError(u)}ba.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Hi.add(`image:${e}`,o),r.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}};var qo=class extends qi{constructor(e){super(e)}load(e,t,n,s){let r=new rn,a=new zc(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},_s=class extends Tt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ee(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Xo=class extends _s{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ee(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Sd=new ke,gg=new C,vg=new C,ir=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new He(512,512),this.mapType=wn,this.map=null,this.mapPass=null,this.matrix=new ke,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Vi,this._frameExtents=new He(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;gg.setFromMatrixPosition(e.matrixWorld),t.position.copy(gg),vg.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vg),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Sd.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Sd,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===er||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Sd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},mc=new C,gc=new dt,zi=new C,jo=class extends Tt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ke,this.projectionMatrix=new ke,this.projectionMatrixInverse=new ke,this.coordinateSystem=li,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(mc,gc,zi),zi.x===1&&zi.y===1&&zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(mc,gc,zi.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(mc,gc,zi),zi.x===1&&zi.y===1&&zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(mc,gc,zi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},$s=new C,bg=new He,xg=new He,sn=class extends jo{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Lr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Eo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Lr*2*Math.atan(Math.tan(Eo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){$s.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($s.x,$s.y).multiplyScalar(-e/$s.z),$s.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set($s.x,$s.y).multiplyScalar(-e/$s.z)}getViewSize(e,t){return this.getViewBounds(e,bg,xg),t.subVectors(xg,bg)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Eo*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Cd=class extends ir{constructor(){super(new sn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Lr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Ms=class extends _s{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Cd}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Pd=class extends ir{constructor(){super(new sn(90,1,.5,500)),this.isPointLightShadow=!0}},zr=class extends _s{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Pd}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},hi=class extends jo{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Id=class extends ir{constructor(){super(new hi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ko=class extends _s{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.shadow=new Id}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ss=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},Yo=class extends Ct{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};var wd=new WeakMap,Jo=class extends qi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&ze("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&ze("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Hi.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{wd.has(a)===!0?(s&&s(wd.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",o.headers=this.requestHeader,o.priority=this.priority,o.cache=this.cache,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Hi.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),wd.set(l,c),Hi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Hi.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var xa=-90,ya=1,Ba=class extends Tt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new sn(xa,ya,e,t);s.layers=this.layers,this.add(s);let r=new sn(xa,ya,e,t);r.layers=this.layers,this.add(r);let a=new sn(xa,ya,e,t);a.layers=this.layers,this.add(a);let o=new sn(xa,ya,e,t);o.layers=this.layers,this.add(o);let l=new sn(xa,ya,e,t);l.layers=this.layers,this.add(l);let c=new sn(xa,ya,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===li)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===er)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let v=!1;e.isWebGLRenderer===!0?v=e.state.buffers.depth.getReversed():v=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Hc=class extends sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},$o=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Ax.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function Ax(){this._document.hidden===!1&&this.reset()}var Gc=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,a;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==s;++o)n[r+o]=n[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(n,r,0,o,s)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,s,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,a=s;r!==a;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,s){dt.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let a=this._workIndex*r;dt.multiplyQuaternionsFlat(e,a,e,t,e,n),dt.slerpFlat(e,t,e,t,e,a,s)}_lerp(e,t,n,s,r){let a=1-s;for(let o=0;o!==r;++o){let l=t+o;e[l]=e[l]*a+e[n+o]*s}}_lerpAdditive(e,t,n,s,r){for(let a=0;a!==r;++a){let o=t+a;e[o]=e[o]+e[n+a]*s}}},df="\\[\\]\\.:\\/",Rx=new RegExp("["+df+"]","g"),ff="[^"+df+"]",Cx="[^"+df.replace("\\.","")+"]",Px=/((?:WC+[\/:])*)/.source.replace("WC",ff),Ix=/(WCOD+)?/.source.replace("WCOD",Cx),Lx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ff),Dx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ff),Fx=new RegExp("^"+Px+Ix+Lx+Dx+"$"),Nx=["material","materials","bones","map"],Ld=class{constructor(e,t,n){let s=n||Rt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Rt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Rx,"")}static parseTrackName(e){let t=Fx.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Nx.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ze("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Rt.Composite=Ld;Rt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Rt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Rt.prototype.GetterByBindingType=[Rt.prototype._getValue_direct,Rt.prototype._getValue_array,Rt.prototype._getValue_arrayElement,Rt.prototype._getValue_toArray];Rt.prototype.SetterByBindingTypeAndVersioning=[[Rt.prototype._setValue_direct,Rt.prototype._setValue_direct_setNeedsUpdate,Rt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_array,Rt.prototype._setValue_array_setNeedsUpdate,Rt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_arrayElement,Rt.prototype._setValue_arrayElement_setNeedsUpdate,Rt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Rt.prototype._setValue_fromArray,Rt.prototype._setValue_fromArray_setNeedsUpdate,Rt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Vc=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,a=r.length,o=new Array(a),l={endingStart:Ar,endingEnd:Ar};for(let c=0;c!==a;++c){let h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=Vg,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let s=this._clip.duration,r=e._clip.duration,a=r/s,o=s/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=s._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case qg:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case Dh:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(s,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,a=n===Wg;if(e===0)return r===-1?s:a&&(r&1)===1?t-s:s;if(n===Lh){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),s>=t||s<0){let o=Math.floor(s/t);s-=t*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=s;if(a&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=Rr,s.endingEnd=Rr):(e?s.endingStart=this.zeroSlopeAtStart?Rr:Ar:s.endingStart=Ro,t?s.endingEnd=this.zeroSlopeAtEnd?Rr:Ar:s.endingEnd=Ro)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,a=this._weightInterpolant;a===null&&(a=s._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}},Ux=new Float32Array(1),Zo=class extends Ri{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){let d=s[u],p=d.name,g=h[p];if(g!==void 0)++g.referenceCount,a[u]=g;else{if(g=a[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,p));continue}let _=t&&t._propertyBindings[u].binding.parsedPath;g=new Gc(Rt.create(n,p,_),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,p),a[u]=g}o[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=s.length,s.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;let u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,a=s[t];a===void 0&&(a={},s[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[s],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Vo(new Float32Array(2),new Float32Array(2),1,Ux),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,a=typeof e=="string"?Br.findByName(s,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=Dh),l!==void 0){let u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let h=new Vc(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?Br.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(s,e,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let a in n){let o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var xf=class xf{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};xf.prototype.isMatrix2=!0;var Dd=xf;function pf(i,e,t,n){let s=Ox(n);switch(t){case Zd:return i*e;case Zc:return i*e/s.components*s.byteLength;case Qc:return i*e/s.components*s.byteLength;case sr:return i*e*2/s.components*s.byteLength;case eh:return i*e*2/s.components*s.byteLength;case Qd:return i*e*3/s.components*s.byteLength;case zn:return i*e*4/s.components*s.byteLength;case th:return i*e*4/s.components*s.byteLength;case tl:case nl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case il:case sl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ih:case rh:return Math.max(i,16)*Math.max(e,8)/4;case nh:case sh:return Math.max(i,8)*Math.max(e,8)/2;case ah:case oh:case ch:case hh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case lh:case rl:case uh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case dh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fh:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case ph:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case mh:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case gh:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case vh:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case bh:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case xh:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case yh:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case _h:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Mh:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Sh:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case wh:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Th:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Eh:case Ah:case Rh:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ch:case Ph:return Math.ceil(i/4)*Math.ceil(e/4)*8;case al:case Ih:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Ox(i){switch(i){case wn:case Kd:return{byteLength:1,components:1};case Va:case Yd:case on:return{byteLength:2,components:1};case Jc:case $c:return{byteLength:2,components:4};case Ci:case Yc:case Jn:return{byteLength:4,components:1};case Jd:case $d:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?ze("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function R0(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Bx(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<u.length;p++){let g=u[d],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let p=0,g=u.length;p<g;p++){let _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var zx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hx=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Gx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,jx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Kx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Yx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Jx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$x=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ey=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ty=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ny=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,iy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,sy=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ry=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ay=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,oy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ly=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,cy=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,hy=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,uy=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,dy=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fy=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,py=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,my="gl_FragColor = linearToOutputTexel( gl_FragColor );",gy=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,vy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,by=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,xy=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,yy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,_y=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,My=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Sy=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,wy=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ty=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ey=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ay=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ry=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cy=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Py=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Iy=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Ly=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Dy=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ny=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Uy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Oy=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ky=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,By=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zy=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hy=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Gy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ky=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Yy=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,$y=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Zy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Qy=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,e_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,t_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,n_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,i_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,s_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,r_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,a_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,o_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,l_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,c_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,h_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,u_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,d_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,f_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,p_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,m_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,g_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,v_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,b_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,x_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,y_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,__=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,M_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,S_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,w_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,T_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,E_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,A_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,R_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,C_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,P_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,I_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,L_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,D_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,F_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,N_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,U_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,O_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,k_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,B_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,z_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,G_=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,W_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,X_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,j_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,K_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Y_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,J_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Z_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Q_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,eM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,iM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,sM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,aM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,oM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,hM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,uM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,pM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,mM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,at={alphahash_fragment:zx,alphahash_pars_fragment:Hx,alphamap_fragment:Gx,alphamap_pars_fragment:Vx,alphatest_fragment:Wx,alphatest_pars_fragment:qx,aomap_fragment:Xx,aomap_pars_fragment:jx,batching_pars_vertex:Kx,batching_vertex:Yx,begin_vertex:Jx,beginnormal_vertex:$x,bsdfs:Zx,iridescence_fragment:Qx,bumpmap_pars_fragment:ey,clipping_planes_fragment:ty,clipping_planes_pars_fragment:ny,clipping_planes_pars_vertex:iy,clipping_planes_vertex:sy,color_fragment:ry,color_pars_fragment:ay,color_pars_vertex:oy,color_vertex:ly,common:cy,defaultnormal_vertex:hy,displacementmap_pars_vertex:uy,displacementmap_vertex:dy,emissivemap_fragment:fy,emissivemap_pars_fragment:py,colorspace_fragment:my,colorspace_pars_fragment:gy,envmap_fragment:vy,envmap_common_pars_fragment:by,envmap_pars_fragment:xy,envmap_pars_vertex:yy,envmap_physical_pars_fragment:Iy,envmap_vertex:_y,fog_vertex:My,fog_pars_vertex:Sy,fog_fragment:wy,fog_pars_fragment:Ty,gradientmap_pars_fragment:Ey,lightmap_pars_fragment:Ay,lights_lambert_fragment:Ry,lights_lambert_pars_fragment:Cy,lights_pars_begin:Py,lights_toon_fragment:Ly,lights_toon_pars_fragment:Dy,lights_phong_fragment:Fy,lights_phong_pars_fragment:Ny,lights_physical_fragment:Uy,lights_physical_pars_fragment:Oy,lights_fragment_begin:ky,lights_fragment_maps:By,lights_fragment_end:zy,lightprobes_pars_fragment:Hy,logdepthbuf_fragment:Gy,logdepthbuf_pars_fragment:Vy,logdepthbuf_pars_vertex:Wy,logdepthbuf_vertex:qy,map_fragment:Xy,map_pars_fragment:jy,map_particle_fragment:Ky,map_particle_pars_fragment:Yy,metalnessmap_fragment:Jy,metalnessmap_pars_fragment:$y,morphinstance_vertex:Zy,morphcolor_vertex:Qy,morphnormal_vertex:e_,morphtarget_pars_vertex:t_,morphtarget_vertex:n_,normal_fragment_begin:i_,normal_fragment_maps:s_,normal_pars_fragment:r_,normal_pars_vertex:a_,normal_vertex:o_,normalmap_pars_fragment:l_,clearcoat_normal_fragment_begin:c_,clearcoat_normal_fragment_maps:h_,clearcoat_pars_fragment:u_,iridescence_pars_fragment:d_,opaque_fragment:f_,packing:p_,premultiplied_alpha_fragment:m_,project_vertex:g_,dithering_fragment:v_,dithering_pars_fragment:b_,roughnessmap_fragment:x_,roughnessmap_pars_fragment:y_,shadowmap_pars_fragment:__,shadowmap_pars_vertex:M_,shadowmap_vertex:S_,shadowmask_pars_fragment:w_,skinbase_vertex:T_,skinning_pars_vertex:E_,skinning_vertex:A_,skinnormal_vertex:R_,specularmap_fragment:C_,specularmap_pars_fragment:P_,tonemapping_fragment:I_,tonemapping_pars_fragment:L_,transmission_fragment:D_,transmission_pars_fragment:F_,uv_pars_fragment:N_,uv_pars_vertex:U_,uv_vertex:O_,worldpos_vertex:k_,background_vert:B_,background_frag:z_,backgroundCube_vert:H_,backgroundCube_frag:G_,cube_vert:V_,cube_frag:W_,depth_vert:q_,depth_frag:X_,distance_vert:j_,distance_frag:K_,equirect_vert:Y_,equirect_frag:J_,linedashed_vert:$_,linedashed_frag:Z_,meshbasic_vert:Q_,meshbasic_frag:eM,meshlambert_vert:tM,meshlambert_frag:nM,meshmatcap_vert:iM,meshmatcap_frag:sM,meshnormal_vert:rM,meshnormal_frag:aM,meshphong_vert:oM,meshphong_frag:lM,meshphysical_vert:cM,meshphysical_frag:hM,meshtoon_vert:uM,meshtoon_frag:dM,points_vert:fM,points_frag:pM,shadow_vert:mM,shadow_frag:gM,sprite_vert:vM,sprite_frag:bM},Ae={common:{diffuse:{value:new Ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new He(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ee(16777215)},opacity:{value:1},center:{value:new He(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},Yi={basic:{uniforms:Tn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.fog]),vertexShader:at.meshbasic_vert,fragmentShader:at.meshbasic_frag},lambert:{uniforms:Tn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Ee(0)},envMapIntensity:{value:1}}]),vertexShader:at.meshlambert_vert,fragmentShader:at.meshlambert_frag},phong:{uniforms:Tn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Ee(0)},specular:{value:new Ee(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:at.meshphong_vert,fragmentShader:at.meshphong_frag},standard:{uniforms:Tn([Ae.common,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.roughnessmap,Ae.metalnessmap,Ae.fog,Ae.lights,{emissive:{value:new Ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag},toon:{uniforms:Tn([Ae.common,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.gradientmap,Ae.fog,Ae.lights,{emissive:{value:new Ee(0)}}]),vertexShader:at.meshtoon_vert,fragmentShader:at.meshtoon_frag},matcap:{uniforms:Tn([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,{matcap:{value:null}}]),vertexShader:at.meshmatcap_vert,fragmentShader:at.meshmatcap_frag},points:{uniforms:Tn([Ae.points,Ae.fog]),vertexShader:at.points_vert,fragmentShader:at.points_frag},dashed:{uniforms:Tn([Ae.common,Ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:at.linedashed_vert,fragmentShader:at.linedashed_frag},depth:{uniforms:Tn([Ae.common,Ae.displacementmap]),vertexShader:at.depth_vert,fragmentShader:at.depth_frag},normal:{uniforms:Tn([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,{opacity:{value:1}}]),vertexShader:at.meshnormal_vert,fragmentShader:at.meshnormal_frag},sprite:{uniforms:Tn([Ae.sprite,Ae.fog]),vertexShader:at.sprite_vert,fragmentShader:at.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:at.background_vert,fragmentShader:at.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:at.backgroundCube_vert,fragmentShader:at.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:at.cube_vert,fragmentShader:at.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:at.equirect_vert,fragmentShader:at.equirect_frag},distance:{uniforms:Tn([Ae.common,Ae.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:at.distance_vert,fragmentShader:at.distance_frag},shadow:{uniforms:Tn([Ae.lights,Ae.fog,{color:{value:new Ee(0)},opacity:{value:1}}]),vertexShader:at.shadow_vert,fragmentShader:at.shadow_frag}};Yi.physical={uniforms:Tn([Yi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new He(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ye},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new He},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ee(0)},specularColor:{value:new Ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new He},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag};var Oh={r:0,b:0,g:0},xM=new ke,C0=new Ye;C0.set(-1,0,0,0,1,0,0,0,1);function yM(i,e,t,n,s,r){let a=new Ee(0),o=s===!0?0:1,l,c,h=null,u=0,d=null;function p(y){let M=y.isScene===!0?y.background:null;if(M&&M.isTexture){let x=y.backgroundBlurriness>0;M=e.get(M,x)}return M}function g(y){let M=!1,x=p(y);x===null?v(a,o):x&&x.isColor&&(v(x,1),M=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(y,M){let x=p(M);x&&x.isCubeTexture?(c===void 0&&(c=new Et(new Oa(1,1,1),new Ut({name:"BackgroundCubeMaterial",uniforms:qr(Yi.backgroundCube.uniforms),vertexShader:Yi.backgroundCube.vertexShader,fragmentShader:Yi.backgroundCube.fragmentShader,side:an,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,S,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(xM.makeRotationFromEuler(M.backgroundRotation)).transpose(),x.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(C0),c.material.toneMapped=ct.getTransfer(x.colorSpace)!==wt,(h!==x||u!==x.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=x,u=x.version,d=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new Et(new Or(2,2),new Ut({name:"BackgroundMaterial",uniforms:qr(Yi.background.uniforms),vertexShader:Yi.background.vertexShader,fragmentShader:Yi.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=ct.getTransfer(x.colorSpace)!==wt,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||u!==x.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=x,u=x.version,d=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function v(y,M){y.getRGB(Oh,uf(i)),t.buffers.color.setClear(Oh.r,Oh.g,Oh.b,M,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),o=M,v(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,v(a,o)},render:g,addToRenderList:_,dispose:m}}function _M(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(F,O,z,D,G){let X=!1,H=u(F,D,z,O);r!==H&&(r=H,c(r.object)),X=p(F,D,z,G),X&&g(F,D,z,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,x(F,O,z,D),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return i.createVertexArray()}function c(F){return i.bindVertexArray(F)}function h(F){return i.deleteVertexArray(F)}function u(F,O,z,D){let G=D.wireframe===!0,X=n[O.id];X===void 0&&(X={},n[O.id]=X);let H=F.isInstancedMesh===!0?F.id:0,ie=X[H];ie===void 0&&(ie={},X[H]=ie);let j=ie[z.id];j===void 0&&(j={},ie[z.id]=j);let K=j[G];return K===void 0&&(K=d(l()),j[G]=K),K}function d(F){let O=[],z=[],D=[];for(let G=0;G<t;G++)O[G]=0,z[G]=0,D[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:z,attributeDivisors:D,object:F,attributes:{},index:null}}function p(F,O,z,D){let G=r.attributes,X=O.attributes,H=0,ie=z.getAttributes();for(let j in ie)if(ie[j].location>=0){let $=G[j],ae=X[j];if(ae===void 0&&(j==="instanceMatrix"&&F.instanceMatrix&&(ae=F.instanceMatrix),j==="instanceColor"&&F.instanceColor&&(ae=F.instanceColor)),$===void 0||$.attribute!==ae||ae&&$.data!==ae.data)return!0;H++}return r.attributesNum!==H||r.index!==D}function g(F,O,z,D){let G={},X=O.attributes,H=0,ie=z.getAttributes();for(let j in ie)if(ie[j].location>=0){let $=X[j];$===void 0&&(j==="instanceMatrix"&&F.instanceMatrix&&($=F.instanceMatrix),j==="instanceColor"&&F.instanceColor&&($=F.instanceColor));let ae={};ae.attribute=$,$&&$.data&&(ae.data=$.data),G[j]=ae,H++}r.attributes=G,r.attributesNum=H,r.index=D}function _(){let F=r.newAttributes;for(let O=0,z=F.length;O<z;O++)F[O]=0}function v(F){m(F,0)}function m(F,O){let z=r.newAttributes,D=r.enabledAttributes,G=r.attributeDivisors;z[F]=1,D[F]===0&&(i.enableVertexAttribArray(F),D[F]=1),G[F]!==O&&(i.vertexAttribDivisor(F,O),G[F]=O)}function y(){let F=r.newAttributes,O=r.enabledAttributes;for(let z=0,D=O.length;z<D;z++)O[z]!==F[z]&&(i.disableVertexAttribArray(z),O[z]=0)}function M(F,O,z,D,G,X,H){H===!0?i.vertexAttribIPointer(F,O,z,G,X):i.vertexAttribPointer(F,O,z,D,G,X)}function x(F,O,z,D){_();let G=D.attributes,X=z.getAttributes(),H=O.defaultAttributeValues;for(let ie in X){let j=X[ie];if(j.location>=0){let K=G[ie];if(K===void 0&&(ie==="instanceMatrix"&&F.instanceMatrix&&(K=F.instanceMatrix),ie==="instanceColor"&&F.instanceColor&&(K=F.instanceColor)),K!==void 0){let $=K.normalized,ae=K.itemSize,he=e.get(K);if(he===void 0)continue;let Y=he.buffer,re=he.type,ve=he.bytesPerElement,Ie=re===i.INT||re===i.UNSIGNED_INT||K.gpuType===Yc;if(K.isInterleavedBufferAttribute){let le=K.data,qe=le.isInterleavedBuffer===!0?le.stride:le.itemSize,bt=K.offset;if(le.isInstancedInterleavedBuffer||le.isInstancedBufferAttribute){for(let Oe=0;Oe<j.locationSize;Oe++)m(j.location+Oe,le.meshPerAttribute);F.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Oe=0;Oe<j.locationSize;Oe++)v(j.location+Oe);i.bindBuffer(i.ARRAY_BUFFER,Y);for(let Oe=0;Oe<j.locationSize;Oe++)M(j.location+Oe,ae/j.locationSize,re,$,qe*ve,(bt+ae/j.locationSize*Oe)*ve,Ie)}else{if(K.isInstancedBufferAttribute){for(let le=0;le<j.locationSize;le++)m(j.location+le,K.meshPerAttribute);F.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let le=0;le<j.locationSize;le++)v(j.location+le);i.bindBuffer(i.ARRAY_BUFFER,Y);for(let le=0;le<j.locationSize;le++)M(j.location+le,ae/j.locationSize,re,$,ae*ve,ae/j.locationSize*le*ve,Ie)}}else if(H!==void 0){let $=H[ie];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(j.location,$);break;case 3:i.vertexAttrib3fv(j.location,$);break;case 4:i.vertexAttrib4fv(j.location,$);break;default:i.vertexAttrib1fv(j.location,$)}}}}y()}function T(){L();for(let F in n){let O=n[F];for(let z in O){let D=O[z];for(let G in D){let X=D[G];for(let H in X)h(X[H].object),delete X[H];delete D[G]}}delete n[F]}}function S(F){if(n[F.id]===void 0)return;let O=n[F.id];for(let z in O){let D=O[z];for(let G in D){let X=D[G];for(let H in X)h(X[H].object),delete X[H];delete D[G]}}delete n[F.id]}function b(F){for(let O in n){let z=n[O];for(let D in z){let G=z[D];if(G[F.id]===void 0)continue;let X=G[F.id];for(let H in X)h(X[H].object),delete X[H];delete G[F.id]}}}function w(F){for(let O in n){let z=n[O],D=F.isInstancedMesh===!0?F.id:0,G=z[D];if(G!==void 0){for(let X in G){let H=G[X];for(let ie in H)h(H[ie].object),delete H[ie];delete G[X]}delete z[D],Object.keys(z).length===0&&delete n[O]}}}function L(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:v,disableUnusedAttributes:y}}function MM(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let p=0;p<h;p++)d+=c[p];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function SM(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(b){return!(b!==zn&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(b){let w=b===on&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==wn&&b!==Jn&&!w&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(b){if(b==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(ze("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&u===!1;t.reversedDepthBuffer===!0&&u===!1&&ze("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&u===!0&&ze("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:x,maxSamples:T,samples:S}}function wM(i){let e=this,t=null,n=0,s=!1,r=!1,a=new Ai,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let g=u.clippingPlanes,_=u.clipIntersection,v=u.clipShadows,m=i.get(u);if(!s||g===null||g.length===0||r&&!v)r?h(null):c();else{let y=r?0:n,M=y*4,x=m.clippingState||null;l.value=x,x=h(g,d,M,p);for(let T=0;T!==M;++T)x[T]=t[T];m.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,g){let _=u!==null?u.length:0,v=null;if(_!==0){if(v=l.value,g!==!0||v===null){let m=p+_*4,y=d.matrixWorldInverse;o.getNormalMatrix(y),(v===null||v.length<m)&&(v=new Float32Array(m));for(let M=0,x=p;M!==_;++M,x+=4)a.copy(u[M]).applyMatrix4(y,o),a.normal.toArray(v,x),v[x+3]=a.constant}l.value=v,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,v}}var hl=class extends Kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ur(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Oa(5,5,5),r=new Ut({name:"CubemapFromEquirect",uniforms:qr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:an,blending:ws});r.uniforms.tEquirect.value=t;let a=new Et(s,r),o=t.minFilter;return t.minFilter===Sn&&(t.minFilter=Gt),new Ba(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},o0=256,TM=3,EM=20,P0=256,I0=16,AM=3,RM=new C,CM=new Ee,ja=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ba(1,10,null),this._boxMesh=new Et(new Oa(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=RM}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let u=l.autoClear,d=l.autoClearColor,p=l.autoClearDepth,g=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(CM));let v=new Ba(n,s,h);return v.position.copy(o),v.update(l,e),l.autoClear=u,l.autoClearColor=d,l.autoClearDepth=p,l.autoClearStencil=g,e.background=_,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=h0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=c0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(o0,lf(e))}_fromTexture(e,t){e.mapping===Gr||e.mapping===Ha?this._setSize(e.image.length===0?o0:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=l0(e,!1,!1),n=Math.log2(e)-TM;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=l0(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Gr||e.mapping===Ha?(this._cubemapMaterial===null&&(this._cubemapMaterial=h0()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=c0()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=PM(),this._integrationMaterial=IM());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/I0);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-AM)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let l=o>0?Math.log2(t)+.5*Math.log2(6/(P0*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=LM());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function l0(i,e,t){return new hl(i,{minFilter:Sn,generateMipmaps:e,type:on,colorSpace:Dn,depthBuffer:t})}function ul(i,e,t){return new Ut({name:i,uniforms:e,vertexShader:at.cube_vert,fragmentShader:t,side:an,blending:ws,depthTest:!1,depthWrite:!1})}function PM(){return ul("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${P0}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function IM(){return ul("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:I0}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function LM(){return ul("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${EM}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function c0(){return ul("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function h0(){return ul("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function DM(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,p=!1){return d==null?null:p?a(d):r(d)}function r(d){if(d&&d.isTexture){let p=d.mapping;if(p===Xc||p===jc)if(e.has(d)){let g=e.get(d).texture;return o(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let _=new hl(g.height);return _.fromEquirectangularTexture(i,d),e.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let p=d.mapping,g=p===Xc||p===jc,_=p===Gr||p===Ha;if(g||_){let v=t.get(d),m=v!==void 0?v.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return n===null&&(n=new ja(i)),v=g?n.fromEquirectangular(d,v):n.fromCubemap(d,v),v.texture.pmremVersion=d.pmremVersion,t.set(d,v),v.texture;if(v!==void 0)return v.texture;{let y=d.image;return g&&y&&y.height>0||_&&y&&l(y)?(n===null&&(n=new ja(i)),v=g?n.fromEquirectangular(d):n.fromCubemap(d),v.texture.pmremVersion=d.pmremVersion,t.set(d,v),d.addEventListener("dispose",h),v.texture):null}}}return d}function o(d,p){return p===Xc?d.mapping=Gr:p===jc&&(d.mapping=Ha),d}function l(d){let p=0,g=6;for(let _=0;_<g;_++)d[_]!==void 0&&p++;return p===g}function c(d){let p=d.target;p.removeEventListener("dispose",c);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function h(d){let p=d.target;p.removeEventListener("dispose",h);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function FM(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Cr("WebGLRenderer: "+n+" extension not supported."),s}}}function NM(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(g=>delete s[g]);function o(g){l(g.target)}function l(g){g.index!==null&&e.remove(g.index);for(let v in g.attributes)e.remove(g.attributes[v]);g.removeEventListener("dispose",o),delete s[g.id],a.unregister(g);let _=r.get(g);_&&(e.remove(_),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function c(g,_){return s[_.id]!==void 0||(_.addEventListener("dispose",o),s[_.id]=new WeakRef(_),a.register(_,_.id,_),t.memory.geometries++),_}function h(g){let _=g.attributes;for(let v in _)e.update(_[v],i.ARRAY_BUFFER)}function u(g){let _=g.index,v=g.attributes.position,m=0;if(v===void 0)return;let y=_!==null?_.array.length:v.array.length/3-1,M=v.count>=65535?No:Fo,x=new M(Math.ceil(y/3)*6,1),T=x.array;if(_!==null){let b=_.array;m=_.version;for(let w=0,L=0;w<y;w+=3){let P=b[w+0],F=b[w+1],O=b[w+2];T[L++]=P,T[L++]=F,T[L++]=F,T[L++]=O,T[L++]=O,T[L++]=P}}else{m=v.version;for(let b=0,w=0;b<y;b+=3){let L=b+0,P=b+1,F=b+2;T[w++]=L,T[w++]=P,T[w++]=P,T[w++]=F,T[w++]=F,T[w++]=L}}x.version=m;let S=r.get(g);S&&e.remove(S),r.set(g,x)}function d(g){let _=r.get(g);if(_){let v=g.index;v!==null&&_.version<v.version&&u(g)}else u(g);return r.get(g)}function p(){for(let g in s){let _=s[g].deref();_!==void 0&&l(_)}}return{get:c,update:h,getWireframeAttribute:d,dispose:p}}function UM(i,e,t){let n;function s(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){i.drawElements(n,d,r,u*a),t.update(d,n,1)}function c(u,d,p){p!==0&&(i.drawElementsInstanced(n,d,r,u*a,p),t.update(d,n,p))}function h(u,d,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,p);let _=0;for(let v=0;v<p;v++)_+=d[v];t.update(_,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function OM(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ke("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function kM(i,e,t){let n=new WeakMap,s=new xt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let L=function(){b.dispose(),n.delete(o),o.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,v=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],M=0;p===!0&&(M=1),g===!0&&(M=2),_===!0&&(M=3);let x=o.attributes.position.count*M,T=1;x>e.maxTextureSize&&(T=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let S=new Float32Array(x*T*4*u),b=new Io(S,x,T,u);b.type=Jn,b.needsUpdate=!0;let w=M*4;for(let P=0;P<u;P++){let F=v[P],O=m[P],z=y[P],D=x*T*4*P;for(let G=0;G<F.count;G++){let X=G*w;p===!0&&(s.fromBufferAttribute(F,G),S[D+X+0]=s.x,S[D+X+1]=s.y,S[D+X+2]=s.z,S[D+X+3]=0),g===!0&&(s.fromBufferAttribute(O,G),S[D+X+4]=s.x,S[D+X+5]=s.y,S[D+X+6]=s.z,S[D+X+7]=0),_===!0&&(s.fromBufferAttribute(z,G),S[D+X+8]=s.x,S[D+X+9]=s.y,S[D+X+10]=s.z,S[D+X+11]=z.itemSize===4?s.w:1)}}d={count:u,texture:b,size:new He(x,T)},n.set(o,d),o.addEventListener("dispose",L)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function BM(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var zM={[zd]:"LINEAR_TONE_MAPPING",[Hd]:"REINHARD_TONE_MAPPING",[Gd]:"CINEON_TONE_MAPPING",[Vd]:"ACES_FILMIC_TONE_MAPPING",[qd]:"AGX_TONE_MAPPING",[Xd]:"NEUTRAL_TONE_MAPPING",[Wd]:"CUSTOM_TONE_MAPPING"};function HM(i,e,t,n,s,r){let a=new Kt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,h=new Ct;h.setAttribute("position",new Dt([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new Dt([0,2,0,0,2,0],2));let u=new Lc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Et(h,u),p=new hi(-1,1,1,-1,0,1),g=null,_=null,v=!1,m,y=null,M=[],x=!1;this.setSize=function(T,S){a.setSize(T,S),o!==null&&o.setSize(T,S),l!==null&&l.setSize(T,S);for(let b=0;b<M.length;b++){let w=M[b];w.setSize&&w.setSize(T,S)}},this.setEffects=function(T){M=T,x=M.length>0&&M[0].isRenderPass===!0;let S=a.width,b=a.height;M.length>0&&o===null&&(o=new Kt(S,b,{type:on,depthBuffer:!1,stencilBuffer:!1}),l=new Kt(S,b,{type:on,depthBuffer:!1,stencilBuffer:!1}));let w=s===!0&&M.some(L=>L.needsDepthTexture===!0);w!==(a.depthTexture!==null)&&(w===!0&&c===null&&(c=new gs(S,b),r===!0&&(c.format=Es,c.type=Wr)),a.dispose(),a.depthTexture=w?c:null,a.resolveDepthBuffer=w,a.storeMultisampledDepthBuffer=w);for(let L=0;L<M.length;L++){let P=M[L];P.setSize&&P.setSize(S,b),w&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(c)}},this.begin=function(T,S){if(v||T.toneMapping===ui&&M.length===0)return!1;if(y=S,S!==null){let b=S.width,w=S.height;(a.width!==b||a.height!==w)&&this.setSize(b,w)}return x===!1&&T.setRenderTarget(a),m=T.toneMapping,T.toneMapping=ui,!0},this.hasRenderPass=function(){return x},this.end=function(T,S){T.toneMapping=m,v=!0;let b=a,w=o;for(let L=0;L<M.length;L++){let P=M[L];P.enabled!==!1&&(P.render(T,w,b,S),P.needsSwap!==!1&&(b=w,w=w===o?l:o))}if(g!==T.outputColorSpace||_!==T.toneMapping){g=T.outputColorSpace,_=T.toneMapping,u.defines={},ct.getTransfer(g)===wt&&(u.defines.SRGB_TRANSFER="");let L=zM[_];L&&(u.defines[L]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,T.setRenderTarget(y),T.render(d,p),y=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),h.dispose(),u.dispose()}}var L0=new rn,D0=new gs(1,1),F0=new Bo(1),N0=new Io,U0=new Aa,O0=new Ur,u0=[],d0=[],f0=new Float32Array(16),p0=new Float32Array(9),m0=new Float32Array(4);function Ka(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=u0[s];if(r===void 0&&(r=new Float32Array(s),u0[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function ln(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function cn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function zh(i,e){let t=d0[e];t===void 0&&(t=new Int32Array(e),d0[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function GM(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function VM(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ln(t,e))return;i.uniform2fv(this.addr,e),cn(t,e)}}function WM(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ln(t,e))return;i.uniform3fv(this.addr,e),cn(t,e)}}function qM(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ln(t,e))return;i.uniform4fv(this.addr,e),cn(t,e)}}function XM(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(ln(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),cn(t,e)}else{if(ln(t,n))return;m0.set(n),i.uniformMatrix2fv(this.addr,!1,m0),cn(t,n)}}function jM(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(ln(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),cn(t,e)}else{if(ln(t,n))return;p0.set(n),i.uniformMatrix3fv(this.addr,!1,p0),cn(t,n)}}function KM(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(ln(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),cn(t,e)}else{if(ln(t,n))return;f0.set(n),i.uniformMatrix4fv(this.addr,!1,f0),cn(t,n)}}function YM(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function JM(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ln(t,e))return;i.uniform2iv(this.addr,e),cn(t,e)}}function $M(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ln(t,e))return;i.uniform3iv(this.addr,e),cn(t,e)}}function ZM(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ln(t,e))return;i.uniform4iv(this.addr,e),cn(t,e)}}function QM(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function eS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ln(t,e))return;i.uniform2uiv(this.addr,e),cn(t,e)}}function tS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ln(t,e))return;i.uniform3uiv(this.addr,e),cn(t,e)}}function nS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ln(t,e))return;i.uniform4uiv(this.addr,e),cn(t,e)}}function Hh(i){return i.version===0&&(i.compareFunction=sf,i.needsUpdate=!0),i}function iS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=Hh(D0):r=L0,t.setTexture2D(e||r,s)}function sS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||U0,s)}function rS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=Hh(F0):r=O0,t.setTextureCube(e||r,s)}function aS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||N0,s)}function oS(i){switch(i){case 5126:return GM;case 35664:return VM;case 35665:return WM;case 35666:return qM;case 35674:return XM;case 35675:return jM;case 35676:return KM;case 5124:case 35670:return YM;case 35667:case 35671:return JM;case 35668:case 35672:return $M;case 35669:case 35673:return ZM;case 5125:return QM;case 36294:return eS;case 36295:return tS;case 36296:return nS;case 35678:case 36198:case 36298:case 36306:case 35682:return iS;case 35679:case 36299:case 36307:return sS;case 35680:case 36300:case 36308:case 36293:return rS;case 36289:case 36303:case 36311:case 36292:return aS}}function lS(i,e){i.uniform1fv(this.addr,e)}function cS(i,e){let t=Ka(e,this.size,2);i.uniform2fv(this.addr,t)}function hS(i,e){let t=Ka(e,this.size,3);i.uniform3fv(this.addr,t)}function uS(i,e){let t=Ka(e,this.size,4);i.uniform4fv(this.addr,t)}function dS(i,e){let t=Ka(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function fS(i,e){let t=Ka(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function pS(i,e){let t=Ka(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function mS(i,e){i.uniform1iv(this.addr,e)}function gS(i,e){i.uniform2iv(this.addr,e)}function vS(i,e){i.uniform3iv(this.addr,e)}function bS(i,e){i.uniform4iv(this.addr,e)}function xS(i,e){i.uniform1uiv(this.addr,e)}function yS(i,e){i.uniform2uiv(this.addr,e)}function _S(i,e){i.uniform3uiv(this.addr,e)}function MS(i,e){i.uniform4uiv(this.addr,e)}function SS(i,e,t){let n=this.cache,s=e.length,r=zh(t,s);ln(n,r)||(i.uniform1iv(this.addr,r),cn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Hh(D0):a=L0;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function wS(i,e,t){let n=this.cache,s=e.length,r=zh(t,s);ln(n,r)||(i.uniform1iv(this.addr,r),cn(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||U0,r[a])}function TS(i,e,t){let n=this.cache,s=e.length,r=zh(t,s);ln(n,r)||(i.uniform1iv(this.addr,r),cn(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Hh(F0):a=O0;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function ES(i,e,t){let n=this.cache,s=e.length,r=zh(t,s);ln(n,r)||(i.uniform1iv(this.addr,r),cn(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||N0,r[a])}function AS(i){switch(i){case 5126:return lS;case 35664:return cS;case 35665:return hS;case 35666:return uS;case 35674:return dS;case 35675:return fS;case 35676:return pS;case 5124:case 35670:return mS;case 35667:case 35671:return gS;case 35668:case 35672:return vS;case 35669:case 35673:return bS;case 5125:return xS;case 36294:return yS;case 36295:return _S;case 36296:return MS;case 35678:case 36198:case 36298:case 36306:case 35682:return SS;case 35679:case 36299:case 36307:return wS;case 35680:case 36300:case 36308:case 36293:return TS;case 36289:case 36303:case 36311:case 36292:return ES}}var Mf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=oS(t.type)}},Sf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=AS(t.type)}},wf=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},yf=/(\w+)(\])?(\[|\.)?/g;function g0(i,e){i.seq.push(e),i.map[e.id]=e}function RS(i,e,t){let n=i.name,s=n.length;for(yf.lastIndex=0;;){let r=yf.exec(n),a=yf.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){g0(t,c===void 0?new Mf(o,i,e):new Sf(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new wf(o),g0(t,u)),t=u}}}var Xa=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);RS(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function v0(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var CS=37297,PS=0;function IS(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var b0=new Ye;function LS(i){ct._getMatrix(b0,ct.workingColorSpace,i);let e=`mat3( ${b0.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(i)){case Co:return[e,"LinearTransferOETF"];case wt:return[e,"sRGBTransferOETF"];default:return ze("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function x0(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+IS(i.getShaderSource(e),o)}else return r}function DS(i,e){let t=LS(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var FS={[zd]:"Linear",[Hd]:"Reinhard",[Gd]:"Cineon",[Vd]:"ACESFilmic",[qd]:"AgX",[Xd]:"Neutral",[Wd]:"Custom"};function NS(i,e){let t=FS[e];return t===void 0?(ze("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var kh=new C;function US(){ct.getLuminanceCoefficients(kh);let i=kh.x.toFixed(4),e=kh.y.toFixed(4),t=kh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function OS(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cl).join(`
`)}function kS(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function BS(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function cl(i){return i!==""}function y0(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function _0(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var zS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tf(i){return i.replace(zS,HS)}function HS(i,e){let t=at[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Tf(t)}var GS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function M0(i){return i.replace(GS,VS)}function VS(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function S0(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var WS={[Qo]:"SHADOWMAP_TYPE_PCF",[za]:"SHADOWMAP_TYPE_VSM"};function qS(i){return WS[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var XS={[Ha]:"ENVMAP_MODE_REFRACTION"};function jS(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":XS[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var KS={[Bd]:"ENVMAP_BLENDING_MULTIPLY",[zg]:"ENVMAP_BLENDING_MIX",[Hg]:"ENVMAP_BLENDING_ADD"};function YS(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":KS[i.combine]||"ENVMAP_BLENDING_NONE"}function JS(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=qS(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=jS(t),u=YS(t),d=OS(t),p=kS(r),g=s.createProgram(),_,v,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(cl).join(`
`),_.length>0&&(_+=`
`),v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(cl).join(`
`),v.length>0&&(v+=`
`)):(_=[S0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cl).join(`
`),v=[S0(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ui?"#define TONE_MAPPING":"",t.toneMapping!==ui?at.tonemapping_pars_fragment:"",t.toneMapping!==ui?NS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",at.colorspace_pars_fragment,DS("linearToOutputTexel",t.outputColorSpace),US(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(cl).join(`
`)),a=Tf(a),a=y0(a,t),a=_0(a,t),o=Tf(o),o=y0(o,t),o=_0(o,t),a=M0(a),o=M0(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,v=["#define varying in",t.glslVersion===af?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===af?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);let y=m+_+a,M=m+v+o,x=v0(s,s.VERTEX_SHADER,y),T=v0(s,s.FRAGMENT_SHADER,M);s.attachShader(g,x),s.attachShader(g,T),t.index0AttributeName!==void 0?s.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function S(P){if(i.debug.checkShaderErrors){let F=s.getProgramInfoLog(g)||"",O=s.getShaderInfoLog(x)||"",z=s.getShaderInfoLog(T)||"",D=F.trim(),G=O.trim(),X=z.trim(),H=!0,ie=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,x,T);else{let j=x0(s,x,"vertex"),K=x0(s,T,"fragment");Ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+D+`
`+j+`
`+K)}else D!==""?ze("WebGLProgram: Program Info Log:",D):(G===""||X==="")&&(ie=!1);ie&&(P.diagnostics={runnable:H,programLog:D,vertexShader:{log:G,prefix:_},fragmentShader:{log:X,prefix:v}})}s.deleteShader(x),s.deleteShader(T),b=new Xa(s,g),w=BS(s,g)}let b;this.getUniforms=function(){return b===void 0&&S(this),b};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(g,CS)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=PS++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=x,this.fragmentShader=T,this}var $S=0,Ef=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Af(e),t.set(e,n)),n}},Af=class{constructor(e){this.id=$S++,this.code=e,this.usedTimes=0}};function ZS(i){return i===sr||i===rl||i===al}function QS(i,e,t,n,s,r){let a=new Lo,o=new Ef,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(b){return l.add(b),b===0?"uv":`uv${b}`}function g(b,w,L,P,F,O){let z=P.fog,D=F.geometry,G=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?P.environment:null,X=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,H=e.get(b.envMap||G,X),ie=d[b.type],j=n.precision;b.precision!==null&&(j=n.getMaxPrecision(b.precision),j!==b.precision&&ze("WebGLProgram.getParameters:",b.precision,"not supported, using",j,"instead."));let K=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,$=K!==void 0?K.length:0,ae=0;D.morphAttributes.position!==void 0&&(ae=1),D.morphAttributes.normal!==void 0&&(ae=2),D.morphAttributes.color!==void 0&&(ae=3);let he,Y,re,ve;if(ie){let Te=Yi[ie];he=Te.vertexShader,Y=Te.fragmentShader}else{he=b.vertexShader,Y=b.fragmentShader;let Te=o.getVertexShaderStage(b),At=o.getFragmentShaderStage(b);o.update(b,Te,At),re=Te.id,ve=At.id}let Ie=i.getRenderTarget(),le=i.state.buffers.depth.getReversed(),qe=F.isInstancedMesh===!0,bt=F.isBatchedMesh===!0,Oe=!!b.map,et=!!b.matcap,ot=!!H,lt=ot&&H.isPMREMTexture===!0,$t=!!b.aoMap,Wt=!!b.lightMap,hn=!!b.bumpMap&&b.wireframe===!1,It=!!b.normalMap,On=!!b.displacementMap,qt=!!b.emissiveMap,ni=!!b.metalnessMap,ii=!!b.roughnessMap,si=b.anisotropy>0,B=b.clearcoat>0,ri=b.diffuseRoughness>0,Ot=b.dispersion>0,kt=b.retroreflectivity>0,Se=b.iridescence>0,nn=b.sheen>0,je=b.transmission>0,Je=si&&!!b.anisotropyMap,I=B&&!!b.clearcoatMap,E=B&&!!b.clearcoatNormalMap,W=B&&!!b.clearcoatRoughnessMap,oe=ri&&!!b.diffuseRoughnessMap,se=Se&&!!b.iridescenceMap,fe=Se&&!!b.iridescenceThicknessMap,xe=nn&&!!b.sheenColorMap,ee=nn&&!!b.sheenRoughnessMap,te=!!b.specularMap,me=!!b.specularColorMap,N=!!b.specularIntensityMap,ne=je&&!!b.transmissionMap,Z=je&&!!b.thicknessMap,ge=!!b.gradientMap,de=!!b.alphaMap,pe=b.alphaTest>0,Ve=!!b.alphaHash,rt=!!b.extensions,ue=ui;b.toneMapped&&(Ie===null||Ie.isXRRenderTarget===!0)&&(ue=i.toneMapping);let Xe=lt?H.isCompressedCubeTexture?H.image[0].mipmaps:H.mipmaps:null,tt={shaderID:ie,shaderType:b.type,shaderName:b.name,vertexShader:he,fragmentShader:Y,defines:b.defines,customVertexShaderID:re,customFragmentShaderID:ve,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:j,batching:bt,batchingColor:bt&&F._colorsTexture!==null,instancing:qe,instancingColor:qe&&F.instanceColor!==null,instancingMorph:qe&&F.morphTexture!==null,outputColorSpace:Ie===null?i.outputColorSpace:Ie.isXRRenderTarget===!0?Ie.texture.colorSpace:ct.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:Oe,matcap:et,envMap:ot,envMapMode:ot&&H.mapping,envMapPMREM:lt,envMapMaxLod:lt?Xe.length-1:null,envMapSize:lt?Xe[0].width:null,aoMap:$t,lightMap:Wt,bumpMap:hn,normalMap:It,displacementMap:On,emissiveMap:qt,normalMapObjectSpace:It&&b.normalMapType===jg,normalMapTangentSpace:It&&b.normalMapType===Fh,packedNormalMap:It&&b.normalMapType===Fh&&ZS(b.normalMap.format),metalnessMap:ni,roughnessMap:ii,anisotropy:si,anisotropyMap:Je,clearcoat:B,clearcoatMap:I,clearcoatNormalMap:E,clearcoatRoughnessMap:W,diffuseRoughness:ri,diffuseRoughnessMap:oe,dispersion:Ot,retroreflection:kt,iridescence:Se,iridescenceMap:se,iridescenceThicknessMap:fe,sheen:nn,sheenColorMap:xe,sheenRoughnessMap:ee,specularMap:te,specularColorMap:me,specularIntensityMap:N,transmission:je,transmissionMap:ne,thicknessMap:Z,gradientMap:ge,opaque:b.transparent===!1&&b.blending===Ts&&b.alphaToCoverage===!1,alphaMap:de,alphaTest:pe,alphaHash:Ve,combine:b.combine,mapUv:Oe&&p(b.map.channel),aoMapUv:$t&&p(b.aoMap.channel),lightMapUv:Wt&&p(b.lightMap.channel),bumpMapUv:hn&&p(b.bumpMap.channel),normalMapUv:It&&p(b.normalMap.channel),displacementMapUv:On&&p(b.displacementMap.channel),emissiveMapUv:qt&&p(b.emissiveMap.channel),metalnessMapUv:ni&&p(b.metalnessMap.channel),roughnessMapUv:ii&&p(b.roughnessMap.channel),anisotropyMapUv:Je&&p(b.anisotropyMap.channel),clearcoatMapUv:I&&p(b.clearcoatMap.channel),clearcoatNormalMapUv:E&&p(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:W&&p(b.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:oe&&p(b.diffuseRoughnessMap.channel),iridescenceMapUv:se&&p(b.iridescenceMap.channel),iridescenceThicknessMapUv:fe&&p(b.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&p(b.sheenColorMap.channel),sheenRoughnessMapUv:ee&&p(b.sheenRoughnessMap.channel),specularMapUv:te&&p(b.specularMap.channel),specularColorMapUv:me&&p(b.specularColorMap.channel),specularIntensityMapUv:N&&p(b.specularIntensityMap.channel),transmissionMapUv:ne&&p(b.transmissionMap.channel),thicknessMapUv:Z&&p(b.thicknessMap.channel),alphaMapUv:de&&p(b.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(It||si),vertexNormals:!!D.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!D.attributes.uv&&(Oe||de),fog:!!z,useFog:b.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||D.attributes.normal===void 0&&It===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:le,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:$,morphTextureStride:ae,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:O.filter(Te=>Te.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:ue,decodeVideoTexture:Oe&&b.map.isVideoTexture===!0&&ct.getTransfer(b.map.colorSpace)===wt,decodeVideoTextureEmissive:qt&&b.emissiveMap.isVideoTexture===!0&&ct.getTransfer(b.emissiveMap.colorSpace)===wt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Mn,flipSided:b.side===an,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:rt&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(rt&&b.extensions.multiDraw===!0||bt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return tt.vertexUv1s=l.has(1),tt.vertexUv2s=l.has(2),tt.vertexUv3s=l.has(3),l.clear(),tt}function _(b){let w=[];if(b.shaderID?w.push(b.shaderID):(w.push(b.customVertexShaderID),w.push(b.customFragmentShaderID)),b.defines!==void 0)for(let L in b.defines)w.push(L),w.push(b.defines[L]);return b.isRawShaderMaterial===!1&&(v(w,b),m(w,b),w.push(i.outputColorSpace)),w.push(b.customProgramCacheKey),w.join()}function v(b,w){b.push(w.precision),b.push(w.outputColorSpace),b.push(w.envMapMode),b.push(w.envMapPMREM),b.push(w.envMapMaxLod),b.push(w.envMapSize),b.push(w.mapUv),b.push(w.alphaMapUv),b.push(w.lightMapUv),b.push(w.aoMapUv),b.push(w.bumpMapUv),b.push(w.normalMapUv),b.push(w.displacementMapUv),b.push(w.emissiveMapUv),b.push(w.metalnessMapUv),b.push(w.roughnessMapUv),b.push(w.anisotropyMapUv),b.push(w.clearcoatMapUv),b.push(w.clearcoatNormalMapUv),b.push(w.clearcoatRoughnessMapUv),b.push(w.diffuseRoughnessMapUv),b.push(w.iridescenceMapUv),b.push(w.iridescenceThicknessMapUv),b.push(w.sheenColorMapUv),b.push(w.sheenRoughnessMapUv),b.push(w.specularMapUv),b.push(w.specularColorMapUv),b.push(w.specularIntensityMapUv),b.push(w.transmissionMapUv),b.push(w.thicknessMapUv),b.push(w.combine),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.morphTargetsCount),b.push(w.numSunLights),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numSpotLightMaps),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numSunLightShadows),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.numSpotLightShadowsWithMaps),b.push(w.numLightProbes),b.push(w.numLightProbeGrids),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.depthPacking)}function m(b,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.retroreflection&&a.enable(24),w.diffuseRoughness&&a.enable(25),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),b.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),b.push(a.mask)}function y(b){let w=d[b.type],L;if(w){let P=Yi[w];L=Xr.clone(P.uniforms)}else L=b.uniforms;return L}function M(b,w){let L=h.get(w);return L!==void 0?++L.usedTimes:(L=new JS(i,w,b,s),c.push(L),h.set(w,L)),L}function x(b){if(--b.usedTimes===0){let w=c.indexOf(b);c[w]=c[c.length-1],c.pop(),h.delete(b.cacheKey),b.destroy()}}function T(b){o.remove(b)}function S(){o.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:y,acquireProgram:M,releaseProgram:x,releaseShaderCache:T,programs:c,dispose:S}}function e1(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function t1(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function w0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function T0(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let p=0;return d.isInstancedMesh&&(p+=2),d.isSkinnedMesh&&(p+=1),p}function o(d,p,g,_,v,m){let y=i[e];return y===void 0?(y={id:d.id,object:d,geometry:p,material:g,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:v,group:m},i[e]=y):(y.id=d.id,y.object=d,y.geometry=p,y.material=g,y.materialVariant=a(d),y.groupOrder=_,y.renderOrder=d.renderOrder,y.z=v,y.group=m),e++,y}function l(d,p,g,_,v,m,y){y.reversedDepth===!0&&(v=-v);let M=o(d,p,g,_,v,m);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):t.push(M)}function c(d,p,g,_,v,m){let y=o(d,p,g,_,v,m);g.transmission>0?n.unshift(y):g.transparent===!0?s.unshift(y):t.unshift(y)}function h(d,p){t.length>1&&t.sort(d||t1),n.length>1&&n.sort(p||w0),s.length>1&&s.sort(p||w0)}function u(){for(let d=e,p=i.length;d<p;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function n1(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new T0,i.set(n,[a])):s>=r.length?(a=new T0,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function i1(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new C,color:new Ee};break;case"SpotLight":t={position:new C,direction:new C,color:new Ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Ee,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Ee,groundColor:new Ee};break;case"RectAreaLight":t={color:new Ee,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function s1(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var r1=0;function a1(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function o1(i){let e=new i1,t=s1(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);let s=new C,r=new ke,a=new ke;function o(c){let h=0,u=0,d=0;for(let O=0;O<9;O++)n.probe[O].set(0,0,0);let p=0,g=0,_=0,v=0,m=0,y=0,M=0,x=0,T=0,S=0,b=0,w=0,L=0,P=0;c.sort(a1);for(let O=0,z=c.length;O<z;O++){let D=c[O],G=D.color,X=D.intensity,H=D.distance,ie=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===sr?ie=D.shadow.map.texture:ie=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=G.r*X,u+=G.g*X,d+=G.b*X;else if(D.isLightProbe){for(let j=0;j<9;j++)n.probe[j].addScaledVector(D.sh.coefficients[j],X);P++}else if(D.isSunLight){let j=e.get(D);if(j.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let K=D.shadow,$=t.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize.copy(K.mapSize).multiply(K.getFrameExtents()),n.sunShadow[g]=$,n.sunShadowMap[g]=ie;let ae=K.getViewportCount();for(let he=0;he<ae;he++)n.sunShadowMatrix[_+he]=K.getMatrix(he),n.sunShadowCascade[_+he]=K._cascadeData[he];_+=ae,g++}n.sun[p]=j,p++}else if(D.isDirectionalLight){let j=e.get(D);if(j.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let K=D.shadow,$=t.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,n.directionalShadow[v]=$,n.directionalShadowMap[v]=ie,n.directionalShadowMatrix[v]=D.shadow.matrix,T++}n.directional[v]=j,v++}else if(D.isSpotLight){let j=e.get(D);j.position.setFromMatrixPosition(D.matrixWorld),j.color.copy(G).multiplyScalar(X),j.distance=H,j.coneCos=Math.cos(D.angle),j.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),j.decay=D.decay,n.spot[y]=j;let K=D.shadow;if(D.map&&(n.spotLightMap[w]=D.map,w++,K.updateMatrices(D),D.castShadow&&L++),n.spotLightMatrix[y]=K.matrix,D.castShadow){let $=t.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,n.spotShadow[y]=$,n.spotShadowMap[y]=ie,b++}y++}else if(D.isRectAreaLight){let j=e.get(D);j.color.copy(G).multiplyScalar(X),j.halfWidth.set(D.width*.5,0,0),j.halfHeight.set(0,D.height*.5,0),n.rectArea[M]=j,M++}else if(D.isPointLight){let j=e.get(D);if(j.color.copy(D.color).multiplyScalar(D.intensity),j.distance=D.distance,j.decay=D.decay,D.castShadow){let K=D.shadow,$=t.get(D);$.shadowIntensity=K.intensity,$.shadowBias=K.bias,$.shadowNormalBias=K.normalBias,$.shadowRadius=K.radius,$.shadowMapSize=K.mapSize,$.shadowCameraNear=K.camera.near,$.shadowCameraFar=K.camera.far,n.pointShadow[m]=$,n.pointShadowMap[m]=ie,n.pointShadowMatrix[m]=D.shadow.matrix,S++}n.point[m]=j,m++}else if(D.isHemisphereLight){let j=e.get(D);j.skyColor.copy(D.color).multiplyScalar(X),j.groundColor.copy(D.groundColor).multiplyScalar(X),n.hemi[x]=j,x++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ae.LTC_FLOAT_1,n.rectAreaLTC2=Ae.LTC_FLOAT_2):(n.rectAreaLTC1=Ae.LTC_HALF_1,n.rectAreaLTC2=Ae.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let F=n.hash;(F.sunLength!==p||F.directionalLength!==v||F.pointLength!==m||F.spotLength!==y||F.rectAreaLength!==M||F.hemiLength!==x||F.numSunShadows!==g||F.numDirectionalShadows!==T||F.numPointShadows!==S||F.numSpotShadows!==b||F.numSpotMaps!==w||F.numLightProbes!==P)&&(n.sun.length=p,n.directional.length=v,n.spot.length=y,n.rectArea.length=M,n.point.length=m,n.hemi.length=x,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=b,n.spotShadowMap.length=b,n.spotLightMatrix.length=b+w-L,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=L,n.numLightProbes=P,F.sunLength=p,F.directionalLength=v,F.pointLength=m,F.spotLength=y,F.rectAreaLength=M,F.hemiLength=x,F.numSunShadows=g,F.numDirectionalShadows=T,F.numPointShadows=S,F.numSpotShadows=b,F.numSpotMaps=w,F.numLightProbes=P,n.version=r1++)}function l(c,h){let u=0,d=0,p=0,g=0,_=0,v=0,m=h.matrixWorldInverse;for(let y=0,M=c.length;y<M;y++){let x=c[y];if(x.isSunLight){let T=n.sun[u];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(m),u++}else if(x.isDirectionalLight){let T=n.directional[d];T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),d++}else if(x.isSpotLight){let T=n.spot[g];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),T.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),g++}else if(x.isRectAreaLight){let T=n.rectArea[_];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),T.halfWidth.set(x.width*.5,0,0),T.halfHeight.set(0,x.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),_++}else if(x.isPointLight){let T=n.point[p];T.position.setFromMatrixPosition(x.matrixWorld),T.position.applyMatrix4(m),p++}else if(x.isHemisphereLight){let T=n.hemi[v];T.direction.setFromMatrixPosition(x.matrixWorld),T.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function E0(i){let e=new o1(i),t=[],n=[],s=[];function r(u){h.camera=u,t.length=0,n.length=0,s.length=0}function a(u){u.isLightProbeGrid?s.push(u):t.push(u)}function o(u){n.push(u)}function l(){e.setup(t),s.sort((u,d)=>u.priority-d.priority||u.id-d.id)}function c(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function l1(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new E0(i),e.set(s,[o])):r>=a.length?(o=new E0(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var c1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,h1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,u1=[new C(1,0,0),new C(-1,0,0),new C(0,1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1)],d1=[new C(0,-1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1),new C(0,-1,0),new C(0,-1,0)],A0=new ke,ll=new C,_f=new C;function f1(i,e,t){let n=new Vi,s=new He,r=new He,a=new xt,o=new Dc,l=new Fc,c={},h=t.maxTextureSize,u={[Xi]:an,[an]:Xi,[Mn]:Mn},d=new Ut({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new He},radius:{value:4}},vertexShader:c1,fragmentShader:h1}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new Ct;g.setAttribute("position",new nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Et(g,d),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qo;let m=this.type;this.render=function(S,b,w){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||S.length===0)return;this.type===qc&&(ze("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Qo);let L=i.getRenderTarget(),P=i.getActiveCubeFace(),F=i.getActiveMipmapLevel(),O=i.state;O.setBlending(ws),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let z=m!==this.type;z&&b.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(G=>G.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,G=S.length;D<G;D++){let X=S[D],H=X.shadow;if(H===void 0){ze("WebGLShadowMap:",X,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let ie=H.getFrameExtents();s.multiply(ie),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ie.x),s.x=r.x*ie.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ie.y),s.y=r.y*ie.y,H.mapSize.y=r.y));let j=i.state.buffers.depth.getReversed();if(H.camera._reversedDepth=j,H.map===null||z===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===za){if(X.isPointLight){ze("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Kt(s.x,s.y,{format:sr,type:on,minFilter:Gt,magFilter:Gt,generateMipmaps:!1}),H.map.texture.name=X.name+".shadowMap",H.map.depthTexture=new gs(s.x,s.y,Jn),H.map.depthTexture.name=X.name+".shadowMapDepth",H.map.depthTexture.format=fs,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=jt,H.map.depthTexture.magFilter=jt}else X.isPointLight?(H.map=new hl(s.x),H.map.depthTexture=new Bo(s.x,Ci)):(H.map=new Kt(s.x,s.y),H.map.depthTexture=new gs(s.x,s.y,Ci)),H.map.depthTexture.name=X.name+".shadowMap",H.map.depthTexture.format=fs,this.type===Qo?(H.map.depthTexture.compareFunction=j?nf:tf,H.map.depthTexture.minFilter=Gt,H.map.depthTexture.magFilter=Gt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=jt,H.map.depthTexture.magFilter=jt);H.camera.updateProjectionMatrix()}H.map.isWebGLCubeRenderTarget!==!0&&(H.map.width!==s.x||H.map.height!==s.y)&&H.map.setSize(s.x,s.y);let K=H.map.isWebGLCubeRenderTarget?6:H.getViewportCount();X.isPointLight!==!0&&H.updateMatrices(X,w);let $=(H.camera.layers.mask&4294967294)!==0?H.camera.layers:w.layers;for(let ae=0;ae<K;ae++){let he=H.getCamera(ae);if(X.isPointLight){let Y=H.camera,re=H.matrix,ve=X.distance||Y.far;ve!==Y.far&&(Y.far=ve,Y.updateProjectionMatrix()),ll.setFromMatrixPosition(X.matrixWorld),Y.position.copy(ll),_f.copy(Y.position),_f.add(u1[ae]),Y.up.copy(d1[ae]),Y.lookAt(_f),Y.updateMatrixWorld(),re.makeTranslation(-ll.x,-ll.y,-ll.z),A0.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),H._frustum.setFromProjectionMatrix(A0,Y.coordinateSystem,Y.reversedDepth)}if(H.map.isWebGLCubeRenderTarget)i.setRenderTarget(H.map,ae),i.clear();else{ae===0&&(i.setRenderTarget(H.map),i.clear());let Y=H.getViewport(ae);a.set(r.x*Y.x,r.y*Y.y,r.x*Y.z,r.y*Y.w),O.viewport(a)}n=H.getFrustum(ae),x(b,w,he,X,$,this.type)}H.isPointLightShadow!==!0&&this.type===za&&y(H,w),H.needsUpdate=!1}m=this.type,v.needsUpdate=!1,i.setRenderTarget(L,P,F)};function y(S,b){let w=e.update(_);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null?S.mapPass=new Kt(s.x,s.y,{format:sr,type:on}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value.set(S.map.width,S.map.height),d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(b,null,w,d,_,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value.set(S.map.width,S.map.height),p.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(b,null,w,p,_,null)}function M(S,b,w,L){let P=null,F=w.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(F!==void 0)P=F;else if(P=w.isPointLight===!0?l:o,i.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let O=P.uuid,z=b.uuid,D=c[O];D===void 0&&(D={},c[O]=D);let G=D[z];G===void 0&&(G=P.clone(),D[z]=G,b.addEventListener("dispose",T)),P=G}if(P.visible=b.visible,P.wireframe=b.wireframe,L===za?P.side=b.shadowSide!==null?b.shadowSide:b.side:P.side=b.shadowSide!==null?b.shadowSide:u[b.side],P.alphaMap=b.alphaMap,P.alphaTest=b.alphaToCoverage===!0?.5:b.alphaTest,P.map=b.map,P.clipShadows=b.clipShadows,P.clippingPlanes=b.clippingPlanes,P.clipIntersection=b.clipIntersection,P.displacementMap=b.displacementMap,P.displacementScale=b.displacementScale,P.displacementBias=b.displacementBias,P.wireframeLinewidth=b.wireframeLinewidth,P.linewidth=b.linewidth,w.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let O=i.properties.get(P);O.light=w}return P}function x(S,b,w,L,P,F){if(S.visible===!1)return;if(S.layers.test(P)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&F===za)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,S.matrixWorld);let D=e.update(S),G=S.material;if(Array.isArray(G)){let X=D.groups;for(let H=0,ie=X.length;H<ie;H++){let j=X[H],K=G[j.materialIndex];if(K&&K.visible){let $=M(S,K,L,F);S.onBeforeShadow(i,S,b,w,D,$,j),i.renderBufferDirect(w,null,D,$,S,j),S.onAfterShadow(i,S,b,w,D,$,j)}}}else if(G.visible){let X=M(S,G,L,F);S.onBeforeShadow(i,S,b,w,D,X,null),i.renderBufferDirect(w,null,D,X,S,null),S.onAfterShadow(i,S,b,w,D,X,null)}}let z=S.children;for(let D=0,G=z.length;D<G;D++)x(z[D],b,w,L,P,F)}function T(S){S.target.removeEventListener("dispose",T);for(let w in c){let L=c[w],P=S.target.uuid;P in L&&(L[P].dispose(),delete L[P])}}}function p1(i,e){function t(){let N=!1,ne=new xt,Z=null,ge=new xt(0,0,0,0);return{setMask:function(de){Z!==de&&!N&&(i.colorMask(de,de,de,de),Z=de)},setLocked:function(de){N=de},setClear:function(de,pe,Ve,rt,ue){ue===!0&&(de*=rt,pe*=rt,Ve*=rt),ne.set(de,pe,Ve,rt),ge.equals(ne)===!1&&(i.clearColor(de,pe,Ve,rt),ge.copy(ne))},reset:function(){N=!1,Z=null,ge.set(-1,0,0,0)}}}function n(){let N=!1,ne=!1,Z=null,ge=null,de=null;return{setReversed:function(pe){if(ne!==pe){let Ve=e.get("EXT_clip_control");pe?Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.ZERO_TO_ONE_EXT):Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.NEGATIVE_ONE_TO_ONE_EXT),ne=pe;let rt=de;de=null,this.setClear(rt)}},getReversed:function(){return ne},setTest:function(pe){pe?le(i.DEPTH_TEST):qe(i.DEPTH_TEST)},setMask:function(pe){Z!==pe&&!N&&(i.depthMask(pe),Z=pe)},setFunc:function(pe){if(ne&&(pe=i0[pe]),ge!==pe){switch(pe){case xc:i.depthFunc(i.NEVER);break;case yc:i.depthFunc(i.ALWAYS);break;case _c:i.depthFunc(i.LESS);break;case Ma:i.depthFunc(i.LEQUAL);break;case Mc:i.depthFunc(i.EQUAL);break;case Sc:i.depthFunc(i.GEQUAL);break;case wc:i.depthFunc(i.GREATER);break;case Tc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=pe}},setLocked:function(pe){N=pe},setClear:function(pe){de!==pe&&(de=pe,ne&&(pe=1-pe),i.clearDepth(pe))},reset:function(){N=!1,Z=null,ge=null,de=null,ne=!1}}}function s(){let N=!1,ne=null,Z=null,ge=null,de=null,pe=null,Ve=null,rt=null,ue=null;return{setTest:function(Xe){N||(Xe?le(i.STENCIL_TEST):qe(i.STENCIL_TEST))},setMask:function(Xe){ne!==Xe&&!N&&(i.stencilMask(Xe),ne=Xe)},setFunc:function(Xe,tt,Te){(Z!==Xe||ge!==tt||de!==Te)&&(i.stencilFunc(Xe,tt,Te),Z=Xe,ge=tt,de=Te)},setOp:function(Xe,tt,Te){(pe!==Xe||Ve!==tt||rt!==Te)&&(i.stencilOp(Xe,tt,Te),pe=Xe,Ve=tt,rt=Te)},setLocked:function(Xe){N=Xe},setClear:function(Xe){ue!==Xe&&(i.clearStencil(Xe),ue=Xe)},reset:function(){N=!1,ne=null,Z=null,ge=null,de=null,pe=null,Ve=null,rt=null,ue=null}}}let r=new t,a=new n,o=new s,l={},c=new WeakMap,h={},u={},d={},p=new WeakMap,g=[],_=null,v=!1,m=null,y=null,M=null,x=null,T=null,S=null,b=null,w=new Ee(0,0,0),L=0,P=!1,F=null,O=null,z=null,D=null,G=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,ie=0,j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(j)[1]),H=ie>=1):j.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),H=ie>=2);let K=null,$={},ae=i.getParameter(i.SCISSOR_BOX),he=i.getParameter(i.VIEWPORT),Y=new xt().fromArray(ae),re=new xt().fromArray(he);function ve(N,ne,Z,ge){let de=new Uint8Array(4),pe=i.createTexture();i.bindTexture(N,pe),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ve=0;Ve<Z;Ve++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D(ne,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,de):i.texImage2D(ne+Ve,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,de);return pe}let Ie={};Ie[i.TEXTURE_2D]=ve(i.TEXTURE_2D,i.TEXTURE_2D,1),Ie[i.TEXTURE_CUBE_MAP]=ve(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ie[i.TEXTURE_2D_ARRAY]=ve(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ie[i.TEXTURE_3D]=ve(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),le(i.DEPTH_TEST),a.setFunc(Ma),hn(!1),It(Fd),le(i.CULL_FACE),$t(ws);function le(N){h[N]!==!0&&(i.enable(N),h[N]=!0)}function qe(N){h[N]!==!1&&(i.disable(N),h[N]=!1)}function bt(N,ne){return d[N]!==ne?(i.bindFramebuffer(N,ne),d[N]=ne,N===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ne),N===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ne),!0):!1}function Oe(N,ne){let Z=g,ge=!1;if(N){Z=p.get(ne),Z===void 0&&(Z=[],p.set(ne,Z));let de=N.textures;if(Z.length!==de.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let pe=0,Ve=de.length;pe<Ve;pe++)Z[pe]=i.COLOR_ATTACHMENT0+pe;Z.length=de.length,ge=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,ge=!0);ge&&i.drawBuffers(Z)}function et(N){return _!==N?(i.useProgram(N),_=N,!0):!1}let ot={[Hr]:i.FUNC_ADD,[Sg]:i.FUNC_SUBTRACT,[wg]:i.FUNC_REVERSE_SUBTRACT};ot[Tg]=i.MIN,ot[Eg]=i.MAX;let lt={[Ag]:i.ZERO,[Rg]:i.ONE,[Cg]:i.SRC_COLOR,[Od]:i.SRC_ALPHA,[Ng]:i.SRC_ALPHA_SATURATE,[Dg]:i.DST_COLOR,[Ig]:i.DST_ALPHA,[Pg]:i.ONE_MINUS_SRC_COLOR,[kd]:i.ONE_MINUS_SRC_ALPHA,[Fg]:i.ONE_MINUS_DST_COLOR,[Lg]:i.ONE_MINUS_DST_ALPHA,[Ug]:i.CONSTANT_COLOR,[Og]:i.ONE_MINUS_CONSTANT_COLOR,[kg]:i.CONSTANT_ALPHA,[Bg]:i.ONE_MINUS_CONSTANT_ALPHA};function $t(N,ne,Z,ge,de,pe,Ve,rt,ue,Xe){if(N===ws){v===!0&&(qe(i.BLEND),v=!1);return}if(v===!1&&(le(i.BLEND),v=!0),N!==Mg){if(N!==m||Xe!==P){if((y!==Hr||T!==Hr)&&(i.blendEquation(i.FUNC_ADD),y=Hr,T=Hr),Xe)switch(N){case Ts:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFunc(i.ONE,i.ONE);break;case Nd:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ud:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ke("WebGLState: Invalid blending: ",N);break}else switch(N){case Ts:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case el:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Nd:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ud:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",N);break}M=null,x=null,S=null,b=null,w.set(0,0,0),L=0,m=N,P=Xe}return}de=de||ne,pe=pe||Z,Ve=Ve||ge,(ne!==y||de!==T)&&(i.blendEquationSeparate(ot[ne],ot[de]),y=ne,T=de),(Z!==M||ge!==x||pe!==S||Ve!==b)&&(i.blendFuncSeparate(lt[Z],lt[ge],lt[pe],lt[Ve]),M=Z,x=ge,S=pe,b=Ve),(rt.equals(w)===!1||ue!==L)&&(i.blendColor(rt.r,rt.g,rt.b,ue),w.copy(rt),L=ue),m=N,P=!1}function Wt(N,ne){N.side===Mn?qe(i.CULL_FACE):le(i.CULL_FACE);let Z=N.side===an;ne&&(Z=!Z),hn(Z),N.blending===Ts&&N.transparent===!1?$t(ws):$t(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);let ge=N.stencilWrite;o.setTest(ge),ge&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),qt(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):qe(i.SAMPLE_ALPHA_TO_COVERAGE)}function hn(N){F!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),F=N)}function It(N){N!==yg?(le(i.CULL_FACE),N!==O&&(N===Fd?i.cullFace(i.BACK):N===_g?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):qe(i.CULL_FACE),O=N}function On(N){N!==z&&(H&&i.lineWidth(N),z=N)}function qt(N,ne,Z){N?(le(i.POLYGON_OFFSET_FILL),(D!==ne||G!==Z)&&(D=ne,G=Z,a.getReversed()&&(ne=-ne,Z=-Z),i.polygonOffset(ne,Z))):qe(i.POLYGON_OFFSET_FILL)}function ni(N){N?le(i.SCISSOR_TEST):qe(i.SCISSOR_TEST)}function ii(N){N===void 0&&(N=i.TEXTURE0+X-1),K!==N&&(i.activeTexture(N),K=N)}function si(N,ne,Z){Z===void 0&&(K===null?Z=i.TEXTURE0+X-1:Z=K);let ge=$[Z];ge===void 0&&(ge={type:void 0,texture:void 0},$[Z]=ge),(ge.type!==N||ge.texture!==ne)&&(K!==Z&&(i.activeTexture(Z),K=Z),i.bindTexture(N,ne||Ie[N]),ge.type=N,ge.texture=ne)}function B(){let N=$[K];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function ri(){try{i.compressedTexImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function Ot(){try{i.compressedTexImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function kt(){try{i.texSubImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function Se(){try{i.texSubImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function nn(){try{i.compressedTexSubImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function je(){try{i.compressedTexSubImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function Je(){try{i.texStorage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function I(){try{i.texStorage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function E(){try{i.texImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function W(){try{i.texImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function oe(N){return u[N]!==void 0?u[N]:i.getParameter(N)}function se(N,ne){u[N]!==ne&&(i.pixelStorei(N,ne),u[N]=ne)}function fe(N){Y.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),Y.copy(N))}function xe(N){re.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),re.copy(N))}function ee(N,ne){let Z=c.get(ne);Z===void 0&&(Z=new WeakMap,c.set(ne,Z));let ge=Z.get(N);ge===void 0&&(ge=i.getUniformBlockIndex(ne,N.name),i.uniformBlockBinding(ne,ge,ge),Z.set(N,ge))}function te(N,ne,Z){let de=c.get(ne).get(N);l[de]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,de,Z),l[de]=Z)}function me(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},K=null,$={},d={},l={},p=new WeakMap,g=[],_=null,v=!1,m=null,y=null,M=null,x=null,T=null,S=null,b=null,w=new Ee(0,0,0),L=0,P=!1,F=null,O=null,z=null,D=null,G=null,Y.set(0,0,i.canvas.width,i.canvas.height),re.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:le,disable:qe,bindFramebuffer:bt,drawBuffers:Oe,useProgram:et,setBlending:$t,setMaterial:Wt,setFlipSided:hn,setCullFace:It,setLineWidth:On,setPolygonOffset:qt,setScissorTest:ni,activeTexture:ii,bindTexture:si,unbindTexture:B,compressedTexImage2D:ri,compressedTexImage3D:Ot,texImage2D:E,texImage3D:W,pixelStorei:se,getParameter:oe,updateUBOMapping:ee,uniformBlockBinding:te,texStorage2D:Je,texStorage3D:I,texSubImage2D:kt,texSubImage3D:Se,compressedTexSubImage2D:nn,compressedTexSubImage3D:je,scissor:fe,viewport:xe,reset:me}}function m1(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new He,h=new WeakMap,u=new Set,d,p=new WeakMap,g=new Set,_=new FinalizationRegistry(I=>g.delete(I)),v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(I,E){return v?new OffscreenCanvas(I,E):wa("canvas")}function y(I,E,W){let oe=1,se=Je(I);if((se.width>W||se.height>W)&&(oe=W/Math.max(se.width,se.height)),oe<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let fe=Math.floor(oe*se.width),xe=Math.floor(oe*se.height);d===void 0&&(d=m(fe,xe));let ee=E?m(fe,xe):d;return ee.width=fe,ee.height=xe,ee.getContext("2d").drawImage(I,0,0,fe,xe),ze("WebGLRenderer: Texture has been resized from ("+se.width+"x"+se.height+") to ("+fe+"x"+xe+")."),ee}else return"data"in I&&ze("WebGLRenderer: Image in DataTexture is too big ("+se.width+"x"+se.height+")."),I;return I}function M(I){return I.generateMipmaps}function x(I){i.generateMipmap(I)}function T(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(I,E,W,oe,se,fe=!1){if(I!==null){if(i[I]!==void 0)return i[I];ze("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let xe;oe&&(xe=e.get("EXT_texture_norm16"),xe||ze("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ee=E;if(E===i.RED&&(W===i.FLOAT&&(ee=i.R32F),W===i.HALF_FLOAT&&(ee=i.R16F),W===i.UNSIGNED_BYTE&&(ee=i.R8),W===i.UNSIGNED_SHORT&&xe&&(ee=xe.R16_EXT),W===i.SHORT&&xe&&(ee=xe.R16_SNORM_EXT)),E===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.R8UI),W===i.UNSIGNED_SHORT&&(ee=i.R16UI),W===i.UNSIGNED_INT&&(ee=i.R32UI),W===i.BYTE&&(ee=i.R8I),W===i.SHORT&&(ee=i.R16I),W===i.INT&&(ee=i.R32I)),E===i.RG&&(W===i.FLOAT&&(ee=i.RG32F),W===i.HALF_FLOAT&&(ee=i.RG16F),W===i.UNSIGNED_BYTE&&(ee=i.RG8),W===i.UNSIGNED_SHORT&&xe&&(ee=xe.RG16_EXT),W===i.SHORT&&xe&&(ee=xe.RG16_SNORM_EXT)),E===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RG8UI),W===i.UNSIGNED_SHORT&&(ee=i.RG16UI),W===i.UNSIGNED_INT&&(ee=i.RG32UI),W===i.BYTE&&(ee=i.RG8I),W===i.SHORT&&(ee=i.RG16I),W===i.INT&&(ee=i.RG32I)),E===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RGB8UI),W===i.UNSIGNED_SHORT&&(ee=i.RGB16UI),W===i.UNSIGNED_INT&&(ee=i.RGB32UI),W===i.BYTE&&(ee=i.RGB8I),W===i.SHORT&&(ee=i.RGB16I),W===i.INT&&(ee=i.RGB32I)),E===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(ee=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(ee=i.RGBA16UI),W===i.UNSIGNED_INT&&(ee=i.RGBA32UI),W===i.BYTE&&(ee=i.RGBA8I),W===i.SHORT&&(ee=i.RGBA16I),W===i.INT&&(ee=i.RGBA32I)),E===i.RGB&&(W===i.UNSIGNED_SHORT&&xe&&(ee=xe.RGB16_EXT),W===i.SHORT&&xe&&(ee=xe.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&(ee=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(ee=i.R11F_G11F_B10F)),E===i.RGBA){let te=fe?Co:ct.getTransfer(se);W===i.FLOAT&&(ee=i.RGBA32F),W===i.HALF_FLOAT&&(ee=i.RGBA16F),W===i.UNSIGNED_BYTE&&(ee=te===wt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&xe&&(ee=xe.RGBA16_EXT),W===i.SHORT&&xe&&(ee=xe.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&(ee=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(ee=i.RGB5_A1)}return(ee===i.R16F||ee===i.R32F||ee===i.RG16F||ee===i.RG32F||ee===i.RGBA16F||ee===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ee}function b(I,E){let W;return I?E===null||E===Ci||E===Wr?W=i.DEPTH24_STENCIL8:E===Jn?W=i.DEPTH32F_STENCIL8:E===Va&&(W=i.DEPTH24_STENCIL8,ze("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Ci||E===Wr?W=i.DEPTH_COMPONENT24:E===Jn?W=i.DEPTH_COMPONENT32F:E===Va&&(W=i.DEPTH_COMPONENT16),W}function w(I,E){return M(I)===!0||I.isFramebufferTexture&&I.minFilter!==jt&&I.minFilter!==Gt?Math.log2(Math.max(E.width,E.height))+1:I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?E.mipmaps.length:1}function L(I){let E=new WeakRef(I);n.get(I).__ref=E,g.add(E),_.register(I,E,E)}function P(I){let E=n.get(I).__ref;E!==void 0&&(g.delete(E),_.unregister(E))}function F(I){z(I.target)}function O(I){D(I.target)}function z(I){I.removeEventListener("dispose",F),P(I),X(I),I.isVideoTexture&&h.delete(I),I.isHTMLTexture&&u.delete(I)}function D(I){I.removeEventListener("dispose",O),P(I),ie(I)}function G(){for(let I of g){let E=I.deref();E!==void 0&&(E.isRenderTarget===!0?D(E):z(E))}g.clear(),u.clear()}function X(I){let E=n.get(I);if(E.__webglInit===void 0)return;let W=I.source,oe=p.get(W);if(oe){let se=oe[E.__cacheKey];se.usedTimes--,se.usedTimes===0&&H(I),Object.keys(oe).length===0&&p.delete(W)}n.remove(I)}function H(I){let E=n.get(I);i.deleteTexture(E.__webglTexture);let W=I.source,oe=p.get(W);delete oe[E.__cacheKey],a.memory.textures--}function ie(I){let E=n.get(I);E.__depthDisposeCallback&&E.__depthDisposeCallback();let W=I.depthTexture;if(W&&W.renderTarget===I&&z(W),I.isWebGLCubeRenderTarget)for(let se=0;se<6;se++){if(Array.isArray(E.__webglFramebuffer[se]))for(let fe=0;fe<E.__webglFramebuffer[se].length;fe++)i.deleteFramebuffer(E.__webglFramebuffer[se][fe]);else i.deleteFramebuffer(E.__webglFramebuffer[se]);E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer[se])}else{if(Array.isArray(E.__webglFramebuffer))for(let se=0;se<E.__webglFramebuffer.length;se++)i.deleteFramebuffer(E.__webglFramebuffer[se]);else i.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&i.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let se=0;se<E.__webglColorRenderbuffer.length;se++)E.__webglColorRenderbuffer[se]&&i.deleteRenderbuffer(E.__webglColorRenderbuffer[se]);E.__webglDepthRenderbuffer&&i.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let oe=I.textures;for(let se=0,fe=oe.length;se<fe;se++){let xe=n.get(oe[se]);xe.__webglTexture&&(i.deleteTexture(xe.__webglTexture),a.memory.textures--),n.remove(oe[se])}n.remove(I)}let j=0;function K(){j=0}function $(){return j}function ae(I){j=I}function he(){let I=j;return I>=s.maxTextures&&ze("WebGLTextures: Trying to use "+(I+1)+" texture units while this GPU supports only "+s.maxTextures),j+=1,I}function Y(I){let E=[];return E.push(I.wrapS),E.push(I.wrapT),E.push(I.wrapR||0),E.push(I.magFilter),E.push(I.minFilter),E.push(I.anisotropy),E.push(I.internalFormat),E.push(I.format),E.push(I.type),E.push(I.generateMipmaps),E.push(I.mipmapsAutoUpdate),E.push(I.premultiplyAlpha),E.push(I.flipY),E.push(I.unpackAlignment),E.push(I.colorSpace),E.join()}function re(I,E){let W=n.get(I);if(I.isVideoTexture&&nn(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&W.__version!==I.version){let oe=I.image;if(oe===null)ze("WebGLRenderer: Texture marked for update but no image data found.");else if(oe.complete===!1)ze("WebGLRenderer: Texture marked for update but image is incomplete");else{Wt(W,I,E);return}}else I.isExternalTexture&&(W.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+E)}function ve(I,E){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){Wt(W,I,E);return}else I.isExternalTexture&&(W.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+E)}function Ie(I,E){let W=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&W.__version!==I.version){Wt(W,I,E);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+E)}function le(I,E){let W=n.get(I);if(I.version>0&&W.__version!==I.version){hn(W,I,E);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+E)}let qe={[Gi]:i.REPEAT,[oi]:i.CLAMP_TO_EDGE,[Sa]:i.MIRRORED_REPEAT},bt={[jt]:i.NEAREST,[Kc]:i.NEAREST_MIPMAP_NEAREST,[Vr]:i.NEAREST_MIPMAP_LINEAR,[Gt]:i.LINEAR,[Ga]:i.LINEAR_MIPMAP_NEAREST,[Sn]:i.LINEAR_MIPMAP_LINEAR},Oe={[Yg]:i.NEVER,[sf]:i.ALWAYS,[Jg]:i.LESS,[tf]:i.LEQUAL,[$g]:i.EQUAL,[nf]:i.GEQUAL,[Zg]:i.GREATER,[Qg]:i.NOTEQUAL};function et(I,E){if(E.type===Jn&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===Gt||E.magFilter===Ga||E.magFilter===Vr||E.magFilter===Sn||E.minFilter===Gt||E.minFilter===Ga||E.minFilter===Vr||E.minFilter===Sn)&&ze("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,qe[E.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,qe[E.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,qe[E.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,bt[E.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,bt[E.minFilter]),E.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,Oe[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===jt||E.minFilter!==Vr&&E.minFilter!==Sn||E.type===Jn&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,s.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function ot(I,E){let W=!1;I.__webglInit===void 0&&(I.__webglInit=!0,E.addEventListener("dispose",F),L(E));let oe=E.source,se=p.get(oe);se===void 0&&(se={},p.set(oe,se));let fe=Y(E);if(fe!==I.__cacheKey){se[fe]===void 0&&(se[fe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,W=!0),se[fe].usedTimes++;let xe=se[I.__cacheKey];xe!==void 0&&(se[I.__cacheKey].usedTimes--,xe.usedTimes===0&&H(E)),I.__cacheKey=fe,I.__webglTexture=se[fe].texture}return W}function lt(I,E,W){return Math.floor(Math.floor(I/W)/E)}function $t(I,E,W,oe){let fe=I.updateRanges;if(fe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,E.width,E.height,W,oe,E.data);else{fe.sort((N,ne)=>N.start-ne.start);let xe=0;for(let N=1;N<fe.length;N++){let ne=fe[xe],Z=fe[N],ge=ne.start+ne.count,de=lt(Z.start,E.width,4),pe=lt(ne.start,E.width,4);Z.start<=ge+1&&de===pe&&lt(Z.start+Z.count-1,E.width,4)===de?ne.count=Math.max(ne.count,Z.start+Z.count-ne.start):(++xe,fe[xe]=Z)}fe.length=xe+1;let ee=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),me=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,E.width);for(let N=0,ne=fe.length;N<ne;N++){let Z=fe[N],ge=Math.floor(Z.start/4),de=Math.ceil(Z.count/4),pe=ge%E.width,Ve=Math.floor(ge/E.width),rt=de,ue=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,pe),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ve),t.texSubImage2D(i.TEXTURE_2D,0,pe,Ve,rt,ue,W,oe,E.data)}I.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,ee),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,me)}}function Wt(I,E,W){let oe=i.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(oe=i.TEXTURE_2D_ARRAY),E.isData3DTexture&&(oe=i.TEXTURE_3D);let se=ot(I,E),fe=E.source;t.bindTexture(oe,I.__webglTexture,i.TEXTURE0+W);let xe=n.get(fe);if(fe.version!==xe.__version||se===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){let ue=ct.getPrimaries(ct.workingColorSpace),Xe=E.colorSpace===di?null:ct.getPrimaries(E.colorSpace),tt=E.colorSpace===di||ue===Xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,tt)}t.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment);let te=y(E.image,!1,s.maxTextureSize);te=je(E,te);let me=r.convert(E.format,E.colorSpace),N=r.convert(E.type),ne=S(E.internalFormat,me,N,E.normalized,E.colorSpace,E.isVideoTexture);et(oe,E);let Z,ge=E.mipmaps,de=E.isVideoTexture!==!0,pe=xe.__version===void 0||se===!0,Ve=fe.dataReady,rt=w(E,te);if(E.isDepthTexture)ne=b(E.format===Es,E.type),pe&&(de?t.texStorage2D(i.TEXTURE_2D,1,ne,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,ne,te.width,te.height,0,me,N,null));else if(E.isDataTexture)if(ge.length>0){de&&pe&&t.texStorage2D(i.TEXTURE_2D,rt,ne,ge[0].width,ge[0].height);for(let ue=0,Xe=ge.length;ue<Xe;ue++)Z=ge[ue],de?Ve&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Z.width,Z.height,me,N,Z.data):t.texImage2D(i.TEXTURE_2D,ue,ne,Z.width,Z.height,0,me,N,Z.data);E.generateMipmaps=!1}else de?(pe&&t.texStorage2D(i.TEXTURE_2D,rt,ne,te.width,te.height),Ve&&$t(E,te,me,N)):t.texImage2D(i.TEXTURE_2D,0,ne,te.width,te.height,0,me,N,te.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){de&&pe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,rt,ne,ge[0].width,ge[0].height,te.depth);for(let ue=0,Xe=ge.length;ue<Xe;ue++)if(Z=ge[ue],E.format!==zn)if(me!==null)if(de){if(Ve)if(E.layerUpdates.size>0){let tt=pf(Z.width,Z.height,E.format,E.type);for(let Te of E.layerUpdates){let At=Z.data.subarray(Te*tt/Z.data.BYTES_PER_ELEMENT,(Te+1)*tt/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,Te,Z.width,Z.height,1,me,At)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,Z.width,Z.height,te.depth,me,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ue,ne,Z.width,Z.height,te.depth,0,Z.data,0,0);else ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else de?Ve&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,Z.width,Z.height,te.depth,me,N,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ue,ne,Z.width,Z.height,te.depth,0,me,N,Z.data);E.layerUpdates.size>0&&E.clearLayerUpdates()}else{de&&pe&&t.texStorage2D(i.TEXTURE_2D,rt,ne,ge[0].width,ge[0].height);for(let ue=0,Xe=ge.length;ue<Xe;ue++)Z=ge[ue],E.format!==zn?me!==null?de?Ve&&t.compressedTexSubImage2D(i.TEXTURE_2D,ue,0,0,Z.width,Z.height,me,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,ue,ne,Z.width,Z.height,0,Z.data):ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):de?Ve&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Z.width,Z.height,me,N,Z.data):t.texImage2D(i.TEXTURE_2D,ue,ne,Z.width,Z.height,0,me,N,Z.data)}else if(E.isDataArrayTexture)if(de){if(pe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,rt,ne,te.width,te.height,te.depth),Ve)if(E.layerUpdates.size>0){let ue=pf(te.width,te.height,E.format,E.type);for(let Xe of E.layerUpdates){let tt=te.data.subarray(Xe*ue/te.data.BYTES_PER_ELEMENT,(Xe+1)*ue/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Xe,te.width,te.height,1,me,N,tt)}E.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,N,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ne,te.width,te.height,te.depth,0,me,N,te.data);else if(E.isData3DTexture)de?(pe&&t.texStorage3D(i.TEXTURE_3D,rt,ne,te.width,te.height,te.depth),Ve&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,N,te.data)):t.texImage3D(i.TEXTURE_3D,0,ne,te.width,te.height,te.depth,0,me,N,te.data);else if(E.isFramebufferTexture){if(pe)if(de)t.texStorage2D(i.TEXTURE_2D,rt,ne,te.width,te.height);else{let ue=te.width,Xe=te.height;for(let tt=0;tt<rt;tt++)t.texImage2D(i.TEXTURE_2D,tt,ne,ue,Xe,0,me,N,null),ue>>=1,Xe>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in i){let ue=i.canvas;if(ue.hasAttribute("layoutsubtree")||ue.setAttribute("layoutsubtree","true"),te.parentNode!==ue){ue.appendChild(te),u.add(E),ue.onpaint=Xe=>{let tt=Xe.changedElements;for(let Te of u)tt.includes(Te.image)&&(Te.needsUpdate=!0)},ue.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let tt=i.RGBA,Te=i.RGBA,At=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,tt,Te,At,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ge.length>0){if(de&&pe){let ue=Je(ge[0]);t.texStorage2D(i.TEXTURE_2D,rt,ne,ue.width,ue.height)}for(let ue=0,Xe=ge.length;ue<Xe;ue++)Z=ge[ue],de?Ve&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,me,N,Z):t.texImage2D(i.TEXTURE_2D,ue,ne,me,N,Z);E.generateMipmaps=!1}else if(de){if(pe){let ue=Je(te);t.texStorage2D(i.TEXTURE_2D,rt,ne,ue.width,ue.height)}Ve&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,N,te)}else t.texImage2D(i.TEXTURE_2D,0,ne,me,N,te);M(E)&&E.mipmapsAutoUpdate===!0&&x(oe),xe.__version=fe.version,E.onUpdate&&E.onUpdate(E)}I.__version=E.version}function hn(I,E,W){if(E.image.length!==6)return;let oe=ot(I,E),se=E.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+W);let fe=n.get(se);if(se.version!==fe.__version||oe===!0){t.activeTexture(i.TEXTURE0+W);let xe=ct.getPrimaries(ct.workingColorSpace),ee=E.colorSpace===di?null:ct.getPrimaries(E.colorSpace),te=E.colorSpace===di||xe===ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let me=E.isCompressedTexture||E.image[0].isCompressedTexture,N=E.image[0]&&E.image[0].isDataTexture,ne=[];for(let Te=0;Te<6;Te++)!me&&!N?ne[Te]=y(E.image[Te],!0,s.maxCubemapSize):ne[Te]=N?E.image[Te].image:E.image[Te],ne[Te]=je(E,ne[Te]);let Z=ne[0],ge=r.convert(E.format,E.colorSpace),de=r.convert(E.type),pe=S(E.internalFormat,ge,de,E.normalized,E.colorSpace),Ve=E.isVideoTexture!==!0,rt=fe.__version===void 0||oe===!0,ue=se.dataReady,Xe=w(E,Z);et(i.TEXTURE_CUBE_MAP,E);let tt;if(E.isDepthTexture){if(pe=b(E.format===Es,E.type),rt)if(Ve)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,pe,Z.width,Z.height);else for(let Te=0;Te<6;Te++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,pe,Z.width,Z.height,0,ge,de,null)}else if(me){Ve&&rt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Xe,pe,Z.width,Z.height);for(let Te=0;Te<6;Te++){tt=ne[Te].mipmaps;for(let At=0;At<tt.length;At++){let un=tt[At];E.format!==zn?ge!==null?Ve?ue&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At,0,0,un.width,un.height,ge,un.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At,pe,un.width,un.height,0,un.data):ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ve?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At,0,0,un.width,un.height,ge,de,un.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At,pe,un.width,un.height,0,ge,de,un.data)}}}else{if(tt=E.mipmaps,Ve&&rt){tt.length>0&&Xe++;let Te=Je(ne[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Xe,pe,Te.width,Te.height)}for(let Te=0;Te<6;Te++)if(N){Ve?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,0,0,ne[Te].width,ne[Te].height,ge,de,ne[Te].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,pe,ne[Te].width,ne[Te].height,0,ge,de,ne[Te].data);for(let At=0;At<tt.length;At++){let qs=tt[At].image[Te].image;Ve?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At+1,0,0,qs.width,qs.height,ge,de,qs.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At+1,pe,qs.width,qs.height,0,ge,de,qs.data)}}else{Ve?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,0,0,ge,de,ne[Te]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,pe,ge,de,ne[Te]);for(let At=0;At<tt.length;At++){let un=tt[At];Ve?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At+1,0,0,ge,de,un.image[Te]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,At+1,pe,ge,de,un.image[Te])}}}M(E)&&E.mipmapsAutoUpdate===!0&&x(i.TEXTURE_CUBE_MAP),fe.__version=se.version,E.onUpdate&&E.onUpdate(E)}I.__version=E.version}function It(I,E,W,oe,se,fe){let xe=r.convert(W.format,W.colorSpace),ee=r.convert(W.type),te=S(W.internalFormat,xe,ee,W.normalized,W.colorSpace),me=n.get(E),N=n.get(W);if(N.__renderTarget=E,!me.__hasExternalTextures){let ne=Math.max(1,E.width>>fe),Z=Math.max(1,E.height>>fe);se===i.TEXTURE_3D||se===i.TEXTURE_2D_ARRAY?t.texImage3D(se,fe,te,ne,Z,E.depth,0,xe,ee,null):t.texImage2D(se,fe,te,ne,Z,0,xe,ee,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),Se(E)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,oe,se,N.__webglTexture,0,kt(E)):(se===i.TEXTURE_2D||se>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,oe,se,N.__webglTexture,fe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function On(I,E,W){if(i.bindRenderbuffer(i.RENDERBUFFER,I),E.depthBuffer){let oe=E.depthTexture,se=oe&&oe.isDepthTexture?oe.type:null,fe=b(E.stencilBuffer,se),xe=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Se(E)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,kt(E),fe,E.width,E.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,kt(E),fe,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,fe,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,xe,i.RENDERBUFFER,I)}else{let oe=E.textures;for(let se=0;se<oe.length;se++){let fe=oe[se],xe=r.convert(fe.format,fe.colorSpace),ee=r.convert(fe.type),te=S(fe.internalFormat,xe,ee,fe.normalized,fe.colorSpace);Se(E)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,kt(E),te,E.width,E.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,kt(E),te,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,te,E.width,E.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function qt(I,E,W){let oe=E.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let se=n.get(E.depthTexture);se.__renderTarget=E;let fe=oe?E.depthTexture.image[0]:E.depthTexture.image;(!se.__webglTexture||fe.width!==E.width||fe.height!==E.height)&&(fe.width=E.width,fe.height=E.height,E.depthTexture.needsUpdate=!0),oe?le(E.depthTexture,0):re(E.depthTexture,0);let xe=se.__webglTexture,ee=kt(E),te=oe?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,me=E.depthTexture.format===Es?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(E.depthTexture.format===fs)Se(E)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,te,xe,0,ee):i.framebufferTexture2D(i.FRAMEBUFFER,me,te,xe,0);else if(E.depthTexture.format===Es)Se(E)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,te,xe,0,ee):i.framebufferTexture2D(i.FRAMEBUFFER,me,te,xe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ni(I){let E=n.get(I),W=I.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==I.depthTexture){let oe=I.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),oe){let se=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,oe.removeEventListener("dispose",se)};oe.addEventListener("dispose",se),E.__depthDisposeCallback=se}E.__boundDepthTexture=oe}if(I.depthTexture&&!E.__autoAllocateDepthBuffer)if(W)for(let oe=0;oe<6;oe++)qt(E.__webglFramebuffer[oe],I,oe);else I.texture.mipmaps.length>0?qt(E.__webglFramebuffer[0],I,0):qt(E.__webglFramebuffer,I,0);else if(W){E.__webglDepthbuffer=[];for(let oe=0;oe<6;oe++)if(t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[oe]),E.__webglDepthbuffer[oe]===void 0)E.__webglDepthbuffer[oe]=i.createRenderbuffer(),On(E.__webglDepthbuffer[oe],I,!1);else{let se=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=E.__webglDepthbuffer[oe];i.bindRenderbuffer(i.RENDERBUFFER,fe),i.framebufferRenderbuffer(i.FRAMEBUFFER,se,i.RENDERBUFFER,fe)}}else if(I.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=i.createRenderbuffer(),On(E.__webglDepthbuffer,I,!1);else{let se=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=E.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,fe),i.framebufferRenderbuffer(i.FRAMEBUFFER,se,i.RENDERBUFFER,fe)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ii(I,E,W){let oe=n.get(I);E!==void 0&&It(oe.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&ni(I)}function si(I){let E=I.texture,W=n.get(I),oe=n.get(E);I.addEventListener("dispose",O),L(I);let se=I.textures,fe=I.isWebGLCubeRenderTarget===!0,xe=se.length>1;if(xe||(oe.__webglTexture===void 0&&(oe.__webglTexture=i.createTexture()),oe.__version=E.version,a.memory.textures++),fe){W.__webglFramebuffer=[];for(let ee=0;ee<6;ee++)if(E.mipmaps.length>0){W.__webglFramebuffer[ee]=[];for(let te=0;te<E.mipmaps.length;te++)W.__webglFramebuffer[ee][te]=i.createFramebuffer()}else W.__webglFramebuffer[ee]=i.createFramebuffer()}else{if(E.mipmaps.length>0){W.__webglFramebuffer=[];for(let ee=0;ee<E.mipmaps.length;ee++)W.__webglFramebuffer[ee]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(xe)for(let ee=0,te=se.length;ee<te;ee++){let me=n.get(se[ee]);me.__webglTexture===void 0&&(me.__webglTexture=i.createTexture(),a.memory.textures++)}if(I.samples>0&&Se(I)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let ee=0;ee<se.length;ee++){let te=se[ee];W.__webglColorRenderbuffer[ee]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[ee]);let me=r.convert(te.format,te.colorSpace),N=r.convert(te.type),ne=S(te.internalFormat,me,N,te.normalized,te.colorSpace,I.isXRRenderTarget===!0),Z=kt(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,ne,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ee,i.RENDERBUFFER,W.__webglColorRenderbuffer[ee])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),On(W.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(fe){t.bindTexture(i.TEXTURE_CUBE_MAP,oe.__webglTexture),et(i.TEXTURE_CUBE_MAP,E);for(let ee=0;ee<6;ee++)if(E.mipmaps.length>0)for(let te=0;te<E.mipmaps.length;te++)It(W.__webglFramebuffer[ee][te],I,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,te);else It(W.__webglFramebuffer[ee],I,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0);M(E)?x(i.TEXTURE_CUBE_MAP):E.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,E.mipmaps.length-1),t.unbindTexture()}else if(xe){for(let ee=0,te=se.length;ee<te;ee++){let me=se[ee],N=n.get(me),ne=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ne=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,N.__webglTexture),et(ne,me),It(W.__webglFramebuffer,I,me,i.COLOR_ATTACHMENT0+ee,ne,0),M(me)&&x(ne)}t.unbindTexture()}else{let ee=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ee=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ee,oe.__webglTexture),et(ee,E),E.mipmaps.length>0)for(let te=0;te<E.mipmaps.length;te++)It(W.__webglFramebuffer[te],I,E,i.COLOR_ATTACHMENT0,ee,te);else It(W.__webglFramebuffer,I,E,i.COLOR_ATTACHMENT0,ee,0);M(E)?x(ee):E.mipmaps.length>0&&i.texParameteri(ee,i.TEXTURE_MAX_LEVEL,E.mipmaps.length-1),t.unbindTexture()}I.depthBuffer&&ni(I)}function B(I){let E=I.textures;for(let W=0,oe=E.length;W<oe;W++){let se=E[W];if(M(se)&&se.mipmapsAutoUpdate===!0){let fe=T(I),xe=n.get(se).__webglTexture;t.bindTexture(fe,xe),x(fe),t.unbindTexture()}}}let ri=[];function Ot(I){if(I.samples>0){if(Se(I)===!1){let E=I.textures,W=I.width,oe=I.height,se=i.COLOR_BUFFER_BIT,fe=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=n.get(I),ee=E.length>1;if(ee)for(let me=0;me<E.length;me++)t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer),I.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let me=0;me<E.length;me++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(se|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(se|=i.STENCIL_BUFFER_BIT)),ee){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xe.__webglColorRenderbuffer[me]);let N=n.get(E[me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,N,0)}i.blitFramebuffer(0,0,W,oe,0,0,W,oe,se,i.NEAREST),l===!0&&(ri.length=0,ri.push(i.COLOR_ATTACHMENT0+me),I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&ri.push(fe),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ri))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ee)for(let me=0;me<E.length;me++){t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,xe.__webglColorRenderbuffer[me]);let N=n.get(E[me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,N,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&l){let E=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[E])}}}function kt(I){return Math.min(s.maxSamples,I.samples)}function Se(I){let E=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function nn(I){let E=a.render.frame;h.get(I)!==E&&(h.set(I,E),I.update())}function je(I,E){let W=I.colorSpace,oe=I.format,se=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||W!==Dn&&W!==di&&(ct.getTransfer(W)===wt?(oe!==zn||se!==wn)&&ze("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",W)),E}function Je(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=he,this.resetTextureUnits=K,this.getTextureUnits=$,this.setTextureUnits=ae,this.setTexture2D=re,this.setTexture2DArray=ve,this.setTexture3D=Ie,this.setTextureCube=le,this.rebindTextures=ii,this.setupRenderTarget=si,this.updateRenderTargetMipmap=B,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=ni,this.setupFrameBufferTexture=It,this.useMultisampledRTT=Se,this.dispose=G}function g1(i,e){function t(n,s=di){let r,a=ct.getTransfer(s);if(n===wn)return i.UNSIGNED_BYTE;if(n===Jc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===$c)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Jd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===$d)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Kd)return i.BYTE;if(n===Yd)return i.SHORT;if(n===Va)return i.UNSIGNED_SHORT;if(n===Yc)return i.INT;if(n===Ci)return i.UNSIGNED_INT;if(n===Jn)return i.FLOAT;if(n===on)return i.HALF_FLOAT;if(n===Zd)return i.ALPHA;if(n===Qd)return i.RGB;if(n===zn)return i.RGBA;if(n===fs)return i.DEPTH_COMPONENT;if(n===Es)return i.DEPTH_STENCIL;if(n===Zc)return i.RED;if(n===Qc)return i.RED_INTEGER;if(n===sr)return i.RG;if(n===eh)return i.RG_INTEGER;if(n===th)return i.RGBA_INTEGER;if(n===tl||n===nl||n===il||n===sl)if(a===wt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===tl)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===nl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===il)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===tl)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===nl)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===il)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sl)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===nh||n===ih||n===sh||n===rh)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===nh)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ih)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===sh)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===rh)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ah||n===oh||n===lh||n===ch||n===hh||n===rl||n===uh)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ah||n===oh)return a===wt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===lh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ch)return r.COMPRESSED_R11_EAC;if(n===hh)return r.COMPRESSED_SIGNED_R11_EAC;if(n===rl)return r.COMPRESSED_RG11_EAC;if(n===uh)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===dh||n===fh||n===ph||n===mh||n===gh||n===vh||n===bh||n===xh||n===yh||n===_h||n===Mh||n===Sh||n===wh||n===Th)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===dh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===fh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ph)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===mh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===gh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===vh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===bh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===xh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===yh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===_h)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Mh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Sh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===wh)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Th)return a===wt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Eh||n===Ah||n===Rh)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Eh)return a===wt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ah)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Rh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ch||n===Ph||n===al||n===Ih)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ch)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ph)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===al)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ih)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Wr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var v1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,b1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Rf=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new zo(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ut({vertexShader:v1,fragmentShader:b1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Et(new Or(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Cf=class extends Ri{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null,_=typeof XRWebGLBinding<"u",v=new Rf,m={},y=t.getContextAttributes(),M=null,x=null,T=[],S=[],b=new He,w=null,L=null,P=new sn;P.viewport=new xt;let F=new sn;F.viewport=new xt;let O=[P,F],z=new Hc,D=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let re=T[Y];return re===void 0&&(re=new Ra,T[Y]=re),re.getTargetRaySpace()},this.getControllerGrip=function(Y){let re=T[Y];return re===void 0&&(re=new Ra,T[Y]=re),re.getGripSpace()},this.getHand=function(Y){let re=T[Y];return re===void 0&&(re=new Ra,T[Y]=re),re.getHandSpace()};function X(Y){let re=S.indexOf(Y.inputSource);if(re===-1)return;let ve=T[re];ve!==void 0&&(ve.update(Y.inputSource,Y.frame,c||a),ve.dispatchEvent({type:Y.type,data:Y.inputSource}))}function H(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",ie);for(let Y=0;Y<T.length;Y++){let re=S[Y];re!==null&&(S[Y]=null,T[Y].disconnect(re))}D=null,G=null,v.reset();for(let Y in m)delete m[Y];if(e.setRenderTarget(M),p=null,d=null,u=null,s=null,x=null,he.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(b.width,b.height,!1),L!==null){let Y=L.camera;Y.fov=L.fov,Y.zoom=L.zoom,Y.updateProjectionMatrix(),L=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&ze("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&ze("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",H),s.addEventListener("inputsourceschange",ie),y.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(b),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,Ie=null,le=null;y.depth&&(le=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=y.stencil?Es:fs,Ie=y.stencil?Wr:Ci);let qe={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(qe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new Kt(d.textureWidth,d.textureHeight,{format:zn,type:wn,depthTexture:new gs(d.textureWidth,d.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ve={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new Kt(p.framebufferWidth,p.framebufferHeight,{format:zn,type:wn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),he.setContext(s),he.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function ie(Y){for(let re=0;re<Y.removed.length;re++){let ve=Y.removed[re],Ie=S.indexOf(ve);Ie>=0&&(S[Ie]=null,T[Ie].disconnect(ve))}for(let re=0;re<Y.added.length;re++){let ve=Y.added[re],Ie=S.indexOf(ve);if(Ie===-1){for(let qe=0;qe<T.length;qe++)if(qe>=S.length){S.push(ve),Ie=qe;break}else if(S[qe]===null){S[qe]=ve,Ie=qe;break}if(Ie===-1)break}let le=T[Ie];le&&le.connect(ve)}}function j(Y,re){re===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(re.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let re=Y.near,ve=Y.far;v.texture!==null&&(v.depthNear>0&&(re=v.depthNear),v.depthFar>0&&(ve=v.depthFar)),z.near=F.near=P.near=re,z.far=F.far=P.far=ve,(D!==z.near||G!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),D=z.near,G=z.far),z.layers.mask=Y.layers.mask|6,P.layers.mask=z.layers.mask&-5,F.layers.mask=z.layers.mask&-3;let Ie=Y.parent,le=z.cameras;j(z,Ie);for(let qe=0;qe<le.length;qe++)j(le[qe],Ie);z.projectionMatrix.copy(P.projectionMatrix),z.projectionMatrixInverse.copy(P.projectionMatrixInverse),L===null&&Y.isPerspectiveCamera&&(L={camera:Y,fov:Y.fov,zoom:Y.zoom}),K(Y,z,Ie)};function K(Y,re,ve){ve===null?Y.matrix.copy(re.matrixWorld):(Y.matrix.copy(ve.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(re.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(re.projectionMatrix),Y.projectionMatrixInverse.copy(re.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Lr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(z)},this.getCameraTexture=function(Y){return m[Y]};let $=null;function ae(Y,re){if(h=re.getViewerPose(c||a),g=re,h!==null){let ve=h.views;p!==null&&(e.setRenderTargetFramebuffer(x,p.framebuffer),e.setRenderTarget(x));let Ie=!1;ve.length!==z.cameras.length&&(z.cameras.length=0,Ie=!0);for(let Oe=0;Oe<ve.length;Oe++){let et=ve[Oe],ot=null;if(p!==null)ot=p.getViewport(et);else{let $t=u.getViewSubImage(d,et);ot=$t.viewport,Oe===0&&(e.setRenderTargetTextures(x,$t.colorTexture,$t.depthStencilTexture),e.setRenderTarget(x))}let lt=O[Oe];lt===void 0&&(lt=new sn,lt.layers.enable(Oe),lt.viewport=new xt,O[Oe]=lt),lt.matrix.fromArray(et.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(et.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(ot.x,ot.y,ot.width,ot.height),Oe===0&&(z.matrix.copy(lt.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Ie===!0&&z.cameras.push(lt)}let le=s.enabledFeatures;if(le&&le.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let Oe=u.getDepthInformation(ve[0]);Oe&&Oe.isValid&&Oe.texture&&v.init(Oe,s.renderState)}if(le&&le.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let Oe=0;Oe<ve.length;Oe++){let et=ve[Oe].camera;if(et){let ot=m[et];ot||(ot=new zo,m[et]=ot);let lt=u.getCameraImage(et);ot.sourceTexture=lt}}}}for(let ve=0;ve<T.length;ve++){let Ie=S[ve],le=T[ve];Ie!==null&&le!==void 0&&le.update(Ie,re,c||a)}$&&$(Y,re),re.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:re}),g=null}let he=new R0;he.setAnimationLoop(ae),this.setAnimationLoop=function(Y){$=Y},this.dispose=function(){}}},x1=new ke,k0=new Ye;k0.set(-1,0,0,0,1,0,0,0,1);function y1(i,e){function t(v,m){v.matrixAutoUpdate===!0&&v.updateMatrix(),m.value.copy(v.matrix)}function n(v,m){m.color.getRGB(v.fogColor.value,uf(i)),m.isFog?(v.fogNear.value=m.near,v.fogFar.value=m.far):m.isFogExp2&&(v.fogDensity.value=m.density)}function s(v,m,y,M,x){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(v,m):m.isMeshLambertMaterial?(r(v,m),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(v,m),u(v,m)):m.isMeshPhongMaterial?(r(v,m),h(v,m),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(v,m),d(v,m),m.isMeshPhysicalMaterial&&p(v,m,x)):m.isMeshMatcapMaterial?(r(v,m),g(v,m)):m.isMeshDepthMaterial?r(v,m):m.isMeshDistanceMaterial?(r(v,m),_(v,m)):m.isMeshNormalMaterial?r(v,m):m.isLineBasicMaterial?(a(v,m),m.isLineDashedMaterial&&o(v,m)):m.isPointsMaterial?l(v,m,y,M):m.isSpriteMaterial?c(v,m):m.isShadowMaterial?(v.color.value.copy(m.color),v.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(v,m){v.opacity.value=m.opacity,m.color&&v.diffuse.value.copy(m.color),m.emissive&&v.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.bumpMap&&(v.bumpMap.value=m.bumpMap,t(m.bumpMap,v.bumpMapTransform),v.bumpScale.value=m.bumpScale,m.side===an&&(v.bumpScale.value*=-1)),m.normalMap&&(v.normalMap.value=m.normalMap,t(m.normalMap,v.normalMapTransform),v.normalScale.value.copy(m.normalScale),m.side===an&&v.normalScale.value.negate()),m.displacementMap&&(v.displacementMap.value=m.displacementMap,t(m.displacementMap,v.displacementMapTransform),v.displacementScale.value=m.displacementScale,v.displacementBias.value=m.displacementBias),m.emissiveMap&&(v.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,v.emissiveMapTransform)),m.specularMap&&(v.specularMap.value=m.specularMap,t(m.specularMap,v.specularMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest);let y=e.get(m),M=y.envMap,x=y.envMapRotation;M&&(v.envMap.value=M,v.envMapRotation.value.setFromMatrix4(x1.makeRotationFromEuler(x)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(k0),v.reflectivity.value=m.reflectivity,v.ior.value=m.ior,v.refractionRatio.value=m.refractionRatio),m.lightMap&&(v.lightMap.value=m.lightMap,v.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,v.lightMapTransform)),m.aoMap&&(v.aoMap.value=m.aoMap,v.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,v.aoMapTransform))}function a(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform))}function o(v,m){v.dashSize.value=m.dashSize,v.totalSize.value=m.dashSize+m.gapSize,v.scale.value=m.scale}function l(v,m,y,M){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.size.value=m.size*y,v.scale.value=M*.5,m.map&&(v.map.value=m.map,t(m.map,v.uvTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function c(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.rotation.value=m.rotation,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function h(v,m){v.specular.value.copy(m.specular),v.shininess.value=Math.max(m.shininess,1e-4)}function u(v,m){m.gradientMap&&(v.gradientMap.value=m.gradientMap)}function d(v,m){v.metalness.value=m.metalness,m.metalnessMap&&(v.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,v.metalnessMapTransform)),v.roughness.value=m.roughness,m.roughnessMap&&(v.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,v.roughnessMapTransform)),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)}function p(v,m,y){v.ior.value=m.ior,m.diffuseRoughness>0&&(v.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(v.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,v.diffuseRoughnessMapTransform))),m.sheen>0&&(v.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),v.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(v.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,v.sheenColorMapTransform)),m.sheenRoughnessMap&&(v.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,v.sheenRoughnessMapTransform))),m.clearcoat>0&&(v.clearcoat.value=m.clearcoat,v.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(v.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,v.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(v.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===an&&v.clearcoatNormalScale.value.negate())),m.dispersion>0&&(v.dispersion.value=m.dispersion),m.retroreflectivity>0&&(v.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(v.iridescence.value=m.iridescence,v.iridescenceIOR.value=m.iridescenceIOR,v.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,v.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(v.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,v.iridescenceMapTransform)),m.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),m.transmission>0&&(v.transmission.value=m.transmission,v.transmissionSamplerMap.value=y.texture,v.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(v.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,v.transmissionMapTransform)),v.thickness.value=m.thickness,m.thicknessMap&&(v.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=m.attenuationDistance,v.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(v.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(v.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=m.specularIntensity,v.specularColor.value.copy(m.specularColor),m.specularColorMap&&(v.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,v.specularColorMapTransform)),m.specularIntensityMap&&(v.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,v.specularIntensityMapTransform))}function g(v,m){m.matcap&&(v.matcap.value=m.matcap)}function _(v,m){let y=e.get(m).light;v.referencePosition.value.setFromMatrixPosition(y.matrixWorld),v.nearDistance.value=y.shadow.camera.near,v.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function _1(i,e,t,n){let s={},r={};function a(y,M){let x=M.program;n.uniformBlockBinding(y,x,s[y.id])}function o(y,M){let x=s[y.id];x===void 0&&(g(y),x=l(y),s[y.id]=x,y.addEventListener("dispose",v));let T=M.program;n.updateUBOMapping(y,T);let S=e.render.frame;r[y.id]!==S&&(c(y),r[y.id]=S)}function l(y){let M=i.createBuffer(),x=y.__size,T=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,x,T),i.bindBuffer(i.UNIFORM_BUFFER,null),M}function c(y){let M=s[y.id],x=y.uniforms,T=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let S=0,b=x.length;S<b;S++){let w=x[S];if(Array.isArray(w))for(let L=0,P=w.length;L<P;L++)h(w[L],S,L,T);else h(w,S,0,T)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(y,M,x,T){if(d(y,M,x,T)===!0){let S=y.__offset,b=y.value;if(Array.isArray(b)){let w=0;for(let L=0;L<b.length;L++){let P=b[L],F=_(P,!0);u(P,y.__data,w),w+=F.storage/Float32Array.BYTES_PER_ELEMENT}}else u(b,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,S,y.__data)}}function u(y,M,x){typeof y=="number"||typeof y=="boolean"?M[x]=y:y.isMatrix3?(M[x]=y.elements[0],M[x+1]=y.elements[1],M[x+2]=y.elements[2],M[x+3]=0,M[x+4]=y.elements[3],M[x+5]=y.elements[4],M[x+6]=y.elements[5],M[x+7]=0,M[x+8]=y.elements[6],M[x+9]=y.elements[7],M[x+10]=y.elements[8],M[x+11]=0):ArrayBuffer.isView(y)?M.set(y.subarray(0,M.length-x),x):y.toArray(M,x)}function d(y,M,x,T){let S=y.value,b=M+"_"+x;if(Array.isArray(S)){T[b]===void 0&&(T[b]=[]);let w=T[b],L=!1;for(let P=0;P<S.length;P++)p(S[P],w,P)===!0&&(L=!0);return L}return p(S,T,b)}function p(y,M,x){if(M[x]===void 0)return typeof y=="number"||typeof y=="boolean"?M[x]=y:ArrayBuffer.isView(y)?M[x]=y.slice():M[x]=y.clone(),!0;{let T=M[x];if(typeof y=="number"||typeof y=="boolean"){if(T!==y)return M[x]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(T.equals(y)===!1)return T.copy(y),!0}}return!1}function g(y){let M=y.uniforms,x=0,T=16;for(let b=0,w=M.length;b<w;b++){let L=Array.isArray(M[b])?M[b]:[M[b]];for(let P=0,F=L.length;P<F;P++){let O=L[P],z=Array.isArray(O.value)?O.value:[O.value],D=Array.isArray(M[b])||Array.isArray(O.value),G=x;for(let H=0,ie=z.length;H<ie;H++){let j=z[H],K=_(j,D),$=x%T,ae=$%K.boundary,he=$+ae;x+=ae,he!==0&&T-he<K.storage&&(x+=T-he),H===0&&(G=x),x+=K.storage}let X=O.type==="int"?Int32Array:O.type==="uint"?Uint32Array:Float32Array;O.__data=new X((x-G)/Float32Array.BYTES_PER_ELEMENT),O.__offset=G}}let S=x%T;return S>0&&(x+=T-S),y.__size=x,y.__cache={},this}function _(y,M){let x={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(x.boundary=4,x.storage=4):y.isVector2?(x.boundary=8,x.storage=8):y.isVector3||y.isColor?(x.boundary=16,x.storage=12):y.isVector4?(x.boundary=16,x.storage=16):y.isMatrix3?(x.boundary=16,x.storage=48):y.isMatrix4?(x.boundary=16,x.storage=64):y.isTexture?ze("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(x.boundary=16,x.storage=y.byteLength):ze("WebGLRenderer: Unsupported uniform value type.",y),M===!0&&(x.boundary=16,x.storage=Math.ceil(x.storage/16)*16),x}function v(y){let M=y.target;M.removeEventListener("dispose",v),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function m(){for(let y in s)i.deleteBuffer(s[y]);s={},r={}}return{bind:a,update:o,dispose:m}}var M1=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ki=null;function S1(){return Ki===null&&(Ki=new Da(M1,16,16,sr,on),Ki.name="DFG_LUT",Ki.minFilter=Gt,Ki.magFilter=Gt,Ki.wrapS=oi,Ki.wrapT=oi,Ki.generateMipmaps=!1,Ki.needsUpdate=!0),Ki}var Bh=class{constructor(e={}){let{canvas:t=e0(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:p=wn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let _=p,v=new Set([th,eh,Qc]),m=new Set([wn,Ci,Va,Wr,Jc,$c]),y=new Uint32Array(4),M=new Int32Array(4),x={textures:[],min:[],max:[],resolution:[]},T=null,S=null,b=[],w=[],L=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,F=!1,O=null,z=null,D=null,G=null;this._outputColorSpace=Ht;let X=0,H=0,ie=null,j=-1,K=null,$=new xt,ae=new xt,he=null,Y=new Ee(0),re=0,ve=t.width,Ie=t.height,le=1,qe=null,bt=null,Oe=new xt(0,0,ve,Ie),et=new xt(0,0,ve,Ie),ot=!1,lt=new Vi,$t=new Rc,Wt=!1,hn=!1,It=new ke,On=new C,qt=new xt,ni={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ii=!1;function si(){return ie===null?le:1}let B=n;function ri(A,U){return t.getContext(A,U)}let Ot,kt,Se,nn,je,Je,I,E,W,oe,se,fe,xe,ee,te,me,N,ne,Z,ge,de,pe,Ve;try{let A={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Xe,!1),t.addEventListener("webglcontextrestored",tt,!1),t.addEventListener("webglcontextcreationerror",Te,!1),B===null){let U="webgl2";if(B=ri(U,A),B===null)throw ri(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}rt()}catch(A){throw t.removeEventListener("webglcontextlost",Xe,!1),t.removeEventListener("webglcontextrestored",tt,!1),t.removeEventListener("webglcontextcreationerror",Te,!1),Ke("WebGLRenderer: "+A.message),A}function rt(){Ot=new FM(B),Ot.init(),de=new g1(B,Ot),kt=new SM(B,Ot,e,de),Se=new p1(B,Ot),kt.reversedDepthBuffer&&d&&Se.buffers.depth.setReversed(!0),z=B.createFramebuffer(),D=B.createFramebuffer(),G=B.createFramebuffer(),nn=new OM(B),je=new e1,Je=new m1(B,Ot,Se,je,kt,de,nn),I=new DM(P),E=new Bx(B),pe=new _M(B,E),W=new NM(B,E,nn,pe),oe=new BM(B,W,E,pe,nn),ne=new kM(B,kt,Je),te=new wM(je),se=new QS(P,I,Ot,kt,pe,te),fe=new y1(P,je),xe=new n1,ee=new l1(Ot),N=new yM(P,I,Se,oe,g,l),me=new f1(P,oe,kt),Ve=new _1(B,nn,kt,Se),Z=new MM(B,Ot,nn),ge=new UM(B,Ot,nn),nn.programs=se.programs,P.capabilities=kt,P.extensions=Ot,P.properties=je,P.renderLists=xe,P.shadowMap=me,P.state=Se,P.info=nn}_!==wn&&(L=new HM(_,t.width,t.height,o,s,r));let ue=new Cf(P,B);this.xr=ue,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let A=Ot.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=Ot.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(A){A!==void 0&&(le=A,this.setSize(ve,Ie,!1))},this.getSize=function(A){return A.set(ve,Ie)},this.setSize=function(A,U,J=!0){if(ue.isPresenting){ze("WebGLRenderer: Can't change size while VR device is presenting.");return}ve=A,Ie=U,t.width=Math.floor(A*le),t.height=Math.floor(U*le),J===!0&&(t.style.width=A+"px",t.style.height=U+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,A,U)},this.getDrawingBufferSize=function(A){return A.set(ve*le,Ie*le).floor()},this.setDrawingBufferSize=function(A,U,J){ve=A,Ie=U,le=J,t.width=Math.floor(A*J),t.height=Math.floor(U*J),this.setViewport(0,0,A,U)},this.setEffects=function(A){if(_===wn){Ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let U=0;U<A.length;U++)if(A[U].isOutputPass===!0){ze("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy($)},this.getViewport=function(A){return A.copy(Oe)},this.setViewport=function(A,U,J,V){A.isVector4?Oe.set(A.x,A.y,A.z,A.w):Oe.set(A,U,J,V),Se.viewport($.copy(Oe).multiplyScalar(si()).round())},this.getScissor=function(A){return A.copy(et)},this.setScissor=function(A,U,J,V){A.isVector4?et.set(A.x,A.y,A.z,A.w):et.set(A,U,J,V),Se.scissor(ae.copy(et).multiplyScalar(si()).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(A){Se.setScissorTest(ot=A)},this.setOpaqueSort=function(A){qe=A},this.setTransparentSort=function(A){bt=A},this.getClearColor=function(A){return A.copy(N.getClearColor())},this.setClearColor=function(){N.setClearColor(...arguments)},this.getClearAlpha=function(){return N.getClearAlpha()},this.setClearAlpha=function(){N.setClearAlpha(...arguments)},this.clear=function(A=!0,U=!0,J=!0){let V=0;if(A){let q=!1;if(ie!==null){let ye=ie.texture.format;q=v.has(ye)}if(q){let ye=ie.texture.type,De=m.has(ye),be=N.getClearColor(),Re=N.getClearAlpha(),Be=be.r,$e=be.g,ft=be.b;De?(y[0]=Be,y[1]=$e,y[2]=ft,y[3]=Re,B.clearBufferuiv(B.COLOR,0,y)):(M[0]=Be,M[1]=$e,M[2]=ft,M[3]=Re,B.clearBufferiv(B.COLOR,0,M))}else V|=B.COLOR_BUFFER_BIT}U&&(V|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(V|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&B.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),O=A},this.dispose=function(){t.removeEventListener("webglcontextlost",Xe,!1),t.removeEventListener("webglcontextrestored",tt,!1),t.removeEventListener("webglcontextcreationerror",Te,!1),N.dispose(),xe.dispose(),ee.dispose(),Je.dispose(),je.dispose(),I.dispose(),oe.dispose(),W.dispose(),pe.dispose(),Ve.dispose(),se.dispose(),ue.dispose(),ue.removeEventListener("sessionstart",wm),ue.removeEventListener("sessionend",Tm),yr.stop()};function Xe(A){A.preventDefault(),Po("WebGLRenderer: Context Lost."),F=!0}function tt(){Po("WebGLRenderer: Context Restored."),F=!1;let A=nn.autoReset,U=me.enabled,J=me.autoUpdate,V=me.needsUpdate,q=me.type;rt(),nn.autoReset=A,me.enabled=U,me.autoUpdate=J,me.needsUpdate=V,me.type=q}function Te(A){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function At(A){let U=A.target;U.removeEventListener("dispose",At),un(U)}function un(A){qs(A),je.remove(A)}function qs(A){let U=je.get(A).programs;U!==void 0&&(U.forEach(function(J){se.releaseProgram(J)}),A.isShaderMaterial&&se.releaseShaderCache(A))}this.renderBufferDirect=function(A,U,J,V,q,ye){U===null&&(U=ni);let De=q.isMesh&&q.matrixWorld.determinantAffine()<0,be=Ib(A,U,J,V,q);Se.setMaterial(V,De);let Re=J.index,Be=1;if(V.wireframe===!0){if(Re=W.getWireframeAttribute(J),Re===void 0)return;Be=2}let $e=J.drawRange,ft=J.attributes.position,Fe=$e.start*Be,pt=($e.start+$e.count)*Be;ye!==null&&(Fe=Math.max(Fe,ye.start*Be),pt=Math.min(pt,(ye.start+ye.count)*Be)),Re!==null?(Fe=Math.max(Fe,0),pt=Math.min(pt,Re.count)):ft!=null&&(Fe=Math.max(Fe,0),pt=Math.min(pt,ft.count));let Zt=pt-Fe;if(Zt<0||Zt===1/0)return;pe.setup(q,V,be,J,Re);let Nt,Lt=Z;if(Re!==null&&(Nt=E.get(Re),Lt=ge,Lt.setIndex(Nt)),q.isMesh)V.wireframe===!0?(Se.setLineWidth(V.wireframeLinewidth*si()),Lt.setMode(B.LINES)):Lt.setMode(B.TRIANGLES);else if(q.isLine){let vn=V.linewidth;vn===void 0&&(vn=1),Se.setLineWidth(vn*si()),q.isLineSegments?Lt.setMode(B.LINES):q.isLineLoop?Lt.setMode(B.LINE_LOOP):Lt.setMode(B.LINE_STRIP)}else q.isPoints?Lt.setMode(B.POINTS):q.isSprite&&Lt.setMode(B.TRIANGLES);if(q.isBatchedMesh)if(Ot.get("WEBGL_multi_draw"))Lt.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let vn=q._multiDrawStarts,Ne=q._multiDrawCounts,In=q._multiDrawCount,yt=Re?E.get(Re).bytesPerElement:1,_r=je.get(V).currentProgram.getUniforms();for(let bn=0;bn<In;bn++)_r.setValue(B,"_gl_DrawID",bn),Lt.render(vn[bn]/yt,Ne[bn])}else if(q.isInstancedMesh)Lt.renderInstances(Fe,Zt,q.count);else if(J.isInstancedBufferGeometry){let vn=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Ne=Math.min(J.instanceCount,vn);Lt.renderInstances(Fe,Zt,Ne)}else Lt.render(Fe,Zt)};function Sm(A,U,J,V){O!==null&&A.isNodeMaterial&&O.setObject(V,A),Wt===!0&&te.setState(A,J,!1),A.transparent===!0&&A.side===Mn&&A.forceSinglePass===!1?(A.side=an,A.needsUpdate=!0,go(A,U,V),A.side=Xi,A.needsUpdate=!0,go(A,U,V),A.side=Mn):go(A,U,V)}this.compile=function(A,U,J=null){J===null&&(J=A),O!==null&&O.renderStart(A,U,J),S=ee.get(J),S.init(U),w.push(S),J.traverseVisible(function(q){q.isLight&&q.layers.test(U.layers)&&(S.pushLight(q),q.castShadow&&S.pushShadow(q))}),A!==J&&A.traverseVisible(function(q){q.isLight&&q.layers.test(U.layers)&&(S.pushLight(q),q.castShadow&&S.pushShadow(q))}),S.setupLights(),O!==null&&O.updateLights(S.state.lightsArray),hn=this.localClippingEnabled,Wt=te.init(this.clippingPlanes,hn),Wt===!0&&te.setGlobalState(this.clippingPlanes,U),O!==null&&me.render(S.state.shadowsArray,J,U);let V=new Set;return A.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let ye=q.material;if(ye)if(Array.isArray(ye))for(let De=0;De<ye.length;De++){let be=ye[De];Sm(be,J,U,q),V.add(be)}else Sm(ye,J,U,q),V.add(ye)}),S=w.pop(),O!==null&&O.renderEnd(),V},this.compileAsync=function(A,U,J=null){let V=this.compile(A,U,J);return new Promise(q=>{function ye(){if(V.forEach(function(De){let Re=je.get(De).currentProgram;(Re===void 0||Re.isReady())&&V.delete(De)}),V.size===0){q(A);return}setTimeout(ye,10)}Ot.get("KHR_parallel_shader_compile")!==null?ye():setTimeout(ye,10)})};let Qu=null;function Cb(A){Qu&&Qu(A)}function wm(){yr.stop()}function Tm(){yr.start()}let yr=new R0;yr.setAnimationLoop(Cb),typeof self<"u"&&yr.setContext(self),this.setAnimationLoop=function(A){Qu=A,ue.setAnimationLoop(A),A===null?yr.stop():yr.start()},ue.addEventListener("sessionstart",wm),ue.addEventListener("sessionend",Tm),this.render=function(A,U){if(U!==void 0&&U.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;O!==null&&O.renderStart(A,U);let J=ue.enabled===!0&&ue.isPresenting===!0,V=L!==null&&(ie===null||J)&&L.begin(P,ie);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),ue.enabled===!0&&ue.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(ue.cameraAutoUpdate===!0&&ue.updateCamera(U),U=ue.getCamera()),A.isScene===!0&&A.onBeforeRender(P,A,U,ie),S=ee.get(A,w.length),S.init(U),S.state.textureUnits=Je.getTextureUnits(),w.push(S),It.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera?$t.setFromArrayCamera(U):lt.setFromProjectionMatrix(It,li,U.reversedDepth),hn=this.localClippingEnabled,Wt=te.init(this.clippingPlanes,hn),T=xe.get(A,b.length),T.init(),b.push(T),this.info.render.frame++,ue.enabled===!0&&ue.isPresenting===!0){let De=P.xr.getDepthSensingMesh();De!==null&&ed(De,U,-1/0,P.sortObjects)}ed(A,U,0,P.sortObjects),T.finish(),O!==null&&O.updateLights(S.state.lightsArray),P.sortObjects===!0&&T.sort(qe,bt),ii=ue.enabled===!1||ue.isPresenting===!1||ue.hasDepthSensing()===!1,ii&&N.addToRenderList(T,A),this.info.autoReset===!0&&this.info.reset(),Wt===!0&&te.beginShadows();let q=S.state.shadowsArray;if(me.render(q,A,U),Wt===!0&&te.endShadows(),(V&&L.hasRenderPass())===!1){let De=T.opaque,be=T.transmissive;if(S.setupLights(),U.isArrayCamera){let Re=U.cameras;if(be.length>0)for(let Be=0,$e=Re.length;Be<$e;Be++){let ft=Re[Be];Am(De,be,A,ft)}ii&&N.render(A);for(let Be=0,$e=Re.length;Be<$e;Be++){let ft=Re[Be];Em(T,A,ft,ft.viewport)}}else be.length>0&&Am(De,be,A,U),ii&&N.render(A),Em(T,A,U)}ie!==null&&H===0&&(Je.updateMultisampleRenderTarget(ie),Je.updateRenderTargetMipmap(ie)),V&&L.end(P),A.isScene===!0&&A.onAfterRender(P,A,U),pe.resetDefaultState(),j=-1,K=null,w.pop(),w.length>0?(S=w[w.length-1],Je.setTextureUnits(S.state.textureUnits),Wt===!0&&te.setGlobalState(P.clippingPlanes,S.state.camera)):S=null,b.pop(),b.length>0?T=b[b.length-1]:T=null,O!==null&&O.renderEnd()};function ed(A,U,J,V){if(A.visible===!1)return;if(A.layers.test(U.layers)){if(A.isGroup)J=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(U);else if(A.isLight)S.pushLight(A),A.castShadow&&S.pushShadow(A);else if(A.isSprite){let De=U.isArrayCamera?$t:lt;if(!A.frustumCulled||A.intersectsFrustum(De)){V&&qt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(It);let be=oe.update(A),Re=A.material;Re.visible&&T.push(A,be,Re,J,qt.z,null,U)}}else if(A.isMesh||A.isLine||A.isPoints){let De=U.isArrayCamera?$t:lt;if(!A.frustumCulled||A.intersectsFrustum(De)){let be=oe.update(A),Re=A.material;if(V&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),qt.copy(A.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),qt.copy(be.boundingSphere.center)),qt.applyMatrix4(A.matrixWorld).applyMatrix4(It)),Array.isArray(Re)){let Be=be.groups;for(let $e=0,ft=Be.length;$e<ft;$e++){let Fe=Be[$e],pt=Re[Fe.materialIndex];pt&&pt.visible&&T.push(A,be,pt,J,qt.z,Fe,U)}}else Re.visible&&T.push(A,be,Re,J,qt.z,null,U)}}}let ye=A.children;for(let De=0,be=ye.length;De<be;De++)ed(ye[De],U,J,V)}function Em(A,U,J,V){let{opaque:q,transmissive:ye,transparent:De}=A;S.setupLightsView(J),Wt===!0&&te.setGlobalState(P.clippingPlanes,J),V&&Se.viewport($.copy(V)),q.length>0&&Wl(q,U,J),ye.length>0&&Wl(ye,U,J),De.length>0&&Wl(De,U,J),Se.buffers.depth.setTest(!0),Se.buffers.depth.setMask(!0),Se.buffers.color.setMask(!0),Se.setPolygonOffset(!1)}function Am(A,U,J,V){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[V.id]===void 0){let Fe=Ot.has("EXT_color_buffer_half_float")||Ot.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[V.id]=new Kt(1,1,{generateMipmaps:!0,type:Fe?on:wn,minFilter:Sn,samples:Math.max(4,kt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ct.workingColorSpace})}let ye=S.state.transmissionRenderTarget[V.id],De=V.viewport||$;ye.setSize(De.z*P.transmissionResolutionScale,De.w*P.transmissionResolutionScale);let be=P.getRenderTarget(),Re=P.getActiveCubeFace(),Be=P.getActiveMipmapLevel();P.setRenderTarget(ye),P.getClearColor(Y),re=P.getClearAlpha(),re<1&&P.setClearColor(16777215,.5),P.clear(),ii&&N.render(J);let $e=P.toneMapping;P.toneMapping=ui;let ft=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),S.setupLightsView(V),Wt===!0&&te.setGlobalState(P.clippingPlanes,V),Wl(A,J,V),Je.updateMultisampleRenderTarget(ye),Je.updateRenderTargetMipmap(ye),Ot.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let pt=0,Zt=U.length;pt<Zt;pt++){let Nt=U[pt],{object:Lt,geometry:vn,material:Ne,group:In}=Nt;if(Ne.side===Mn&&Lt.layers.test(V.layers)){let yt=Ne.side;Ne.side=an,Ne.needsUpdate=!0,Rm(Lt,J,V,vn,Ne,In),Ne.side=yt,Ne.needsUpdate=!0,Fe=!0}}Fe===!0&&(Je.updateMultisampleRenderTarget(ye),Je.updateRenderTargetMipmap(ye))}P.setRenderTarget(be,Re,Be),P.setClearColor(Y,re),ft!==void 0&&(V.viewport=ft),P.toneMapping=$e}function Wl(A,U,J){let V=U.isScene===!0?U.overrideMaterial:null;for(let q=0,ye=A.length;q<ye;q++){let De=A[q],{object:be,geometry:Re,group:Be}=De,$e=De.material;$e.allowOverride===!0&&V!==null&&($e=V),be.layers.test(J.layers)&&Rm(be,U,J,Re,$e,Be)}}function Rm(A,U,J,V,q,ye){O!==null&&q.isNodeMaterial&&O.setObject(A,q),A.onBeforeRender(P,U,J,V,q,ye),A.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),q.onBeforeRender(P,U,J,V,A,ye),q.transparent===!0&&q.side===Mn&&q.forceSinglePass===!1?(q.side=an,q.needsUpdate=!0,P.renderBufferDirect(J,U,V,q,A,ye),q.side=Xi,q.needsUpdate=!0,P.renderBufferDirect(J,U,V,q,A,ye),q.side=Mn):P.renderBufferDirect(J,U,V,q,A,ye),A.onAfterRender(P,U,J,V,q,ye)}function Cm(A){let U=0;for(let J of A)J.texture!==null&&U++;return U}function go(A,U,J){U.isScene!==!0&&(U=ni);let V=je.get(A),q=S.state.lights,ye=S.state.shadowsArray,De=q.state.version,be=se.getParameters(A,q.state,ye,U,J,S.state.lightProbeGridArray),Re=se.getProgramCacheKey(be),Be=V.programs;V.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?U.environment:null,V.fog=U.fog;let $e=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;V.envMap=I.get(A.envMap||V.environment,$e),V.envMapRotation=V.environment!==null&&A.envMap===null?U.environmentRotation:A.envMapRotation,Be===void 0&&(A.addEventListener("dispose",At),Be=new Map,V.programs=Be,V.programVariants=new Map);let ft=Be.get(Re);if(ft!==void 0){if(V.currentProgram===ft&&V.lightsStateVersion===De)return Im(A,be),ft}else be.uniforms=se.getUniforms(A),O!==null&&A.isNodeMaterial&&O.build(A,J,be),A.onBeforeCompile(be,P),ft=se.acquireProgram(be,Re),Be.set(Re,ft),V.uniforms=be.uniforms;let Fe=V.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Fe.clippingPlanes=te.uniform),Im(A,be),V.needsLights=Db(A),V.lightsStateVersion=De,V.needsLights&&(Fe.ambientLightColor.value=q.state.ambient,Fe.lightProbe.value=q.state.probe,Fe.sunLights.value=q.state.sun,Fe.sunLightShadows.value=q.state.sunShadow,Fe.directionalLights.value=q.state.directional,Fe.directionalLightShadows.value=q.state.directionalShadow,Fe.spotLights.value=q.state.spot,Fe.spotLightShadows.value=q.state.spotShadow,Fe.rectAreaLights.value=q.state.rectArea,Fe.ltc_1.value=q.state.rectAreaLTC1,Fe.ltc_2.value=q.state.rectAreaLTC2,Fe.pointLights.value=q.state.point,Fe.pointLightShadows.value=q.state.pointShadow,Fe.hemisphereLights.value=q.state.hemi,Fe.sunShadowMatrix.value=q.state.sunShadowMatrix,Fe.sunShadowCascade.value=q.state.sunShadowCascade,Fe.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Fe.spotLightMatrix.value=q.state.spotLightMatrix,Fe.spotLightMap.value=q.state.spotLightMap,Fe.pointShadowMatrix.value=q.state.pointShadowMatrix),V.numLightProbeGrids=Cm(S.state.lightProbeGridArray),V.currentProgram=ft,V.uniformsList=null,ft}function Pb(A,U,J,V,q){let ye=je.get(A),De=ye.currentProgram.id+","+V+","+q,be=ye.programVariants.get(De);return be===void 0?(be=go(A,U,J),ye.programVariants.set(De,be)):(ye.currentProgram=be,ye.uniformsList=null,ye.outputColorSpace=V,ye.toneMapping=q),be}function Pm(A){if(A.uniformsList===null){let U=A.currentProgram.getUniforms();A.uniformsList=Xa.seqWithValue(U.seq,A.uniforms)}return A.uniformsList}function Im(A,U){let J=je.get(A);J.outputColorSpace=U.outputColorSpace,J.batching=U.batching,J.batchingColor=U.batchingColor,J.instancing=U.instancing,J.instancingColor=U.instancingColor,J.instancingMorph=U.instancingMorph,J.skinning=U.skinning,J.morphTargets=U.morphTargets,J.morphNormals=U.morphNormals,J.morphColors=U.morphColors,J.morphTargetsCount=U.morphTargetsCount,J.numClippingPlanes=U.numClippingPlanes,J.numIntersection=U.numClipIntersection,J.vertexAlphas=U.vertexAlphas,J.vertexTangents=U.vertexTangents,J.toneMapping=U.toneMapping}function Ib(A,U,J,V,q){U.isScene!==!0&&(U=ni),Je.resetTextureUnits();let ye=U.fog,De=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?U.environment:null,be=ie===null?P.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:ct.workingColorSpace,Re=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Be=I.get(V.envMap||De,Re),$e=V.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,ft=!!J.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Fe=!!J.morphAttributes.position,pt=!!J.morphAttributes.normal,Zt=!!J.morphAttributes.color,Nt=ui;V.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(Nt=P.toneMapping);let Lt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,vn=Lt!==void 0?Lt.length:0,Ne=je.get(V),In=S.state.lights;if(Wt===!0&&(hn===!0||A!==K)){let zt=A===K&&V.id===j;te.setState(V,A,zt)}let yt=!1,_r=!1;V.version===Ne.__version?Ne.needsLights&&Ne.lightsStateVersion!==In.state.version||q.isBatchedMesh&&Ne.batching===!1||!q.isBatchedMesh&&Ne.batching===!0||q.isBatchedMesh&&Ne.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&Ne.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&Ne.instancing===!1||!q.isInstancedMesh&&Ne.instancing===!0||q.isSkinnedMesh&&Ne.skinning===!1||!q.isSkinnedMesh&&Ne.skinning===!0||q.isInstancedMesh&&Ne.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Ne.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&Ne.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&Ne.instancingMorph===!1&&q.morphTexture!==null||Ne.envMap!==Be||V.fog===!0&&Ne.fog!==ye||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==te.numPlanes||Ne.numIntersection!==te.numIntersection)||Ne.vertexAlphas!==$e||Ne.vertexTangents!==ft||Ne.morphTargets!==Fe||Ne.morphNormals!==pt||Ne.morphColors!==Zt||Ne.morphTargetsCount!==vn||Ne.numLightProbeGrids!==Cm(S.state.lightProbeGridArray)?yt=!0:(Ne.outputColorSpace!==be||Ne.toneMapping!==Nt)&&(_r=!0):(yt=!0,Ne.__version=V.version);let bn=Ne.currentProgram;(yt===!0||_r===!0)&&(bn=_r===!0?Pb(V,U,q,be,Nt):go(V,U,q),O&&V.isNodeMaterial&&O.onUpdateProgram(V,bn,Ne));let ql=!1,Xs=!1,Mr=!1,gt=bn.getUniforms(),gn=Ne.uniforms;if(Se.useProgram(bn.program)&&(ql=!0,Xs=!0,Mr=!0),V.id!==j&&(j=V.id,Xs=!0),ql||K!==A){Se.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),gt.setValue(B,"projectionMatrix",A.projectionMatrix),gt.setValue(B,"viewMatrix",A.matrixWorldInverse);let dn=gt.map.cameraPosition;dn!==void 0&&dn.setValue(B,On.setFromMatrixPosition(A.matrixWorld)),kt.logarithmicDepthBuffer&&gt.setValue(B,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&gt.setValue(B,"isOrthographic",A.isOrthographicCamera===!0),K!==A&&(K=A,Xs=!0,Mr=!0)}if(Ne.needsLights&&(In.state.sunShadowMap.length>0&&gt.setValue(B,"sunShadowMap",In.state.sunShadowMap,Je),In.state.directionalShadowMap.length>0&&gt.setValue(B,"directionalShadowMap",In.state.directionalShadowMap,Je),In.state.spotShadowMap.length>0&&gt.setValue(B,"spotShadowMap",In.state.spotShadowMap,Je),In.state.pointShadowMap.length>0&&gt.setValue(B,"pointShadowMap",In.state.pointShadowMap,Je)),q.isSkinnedMesh){gt.setOptional(B,q,"bindMatrix"),gt.setOptional(B,q,"bindMatrixInverse");let zt=q.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),gt.setValue(B,"boneTexture",zt.boneTexture,Je))}q.isBatchedMesh&&(gt.setOptional(B,q,"batchingTexture"),gt.setValue(B,"batchingTexture",q._matricesTexture,Je),gt.setOptional(B,q,"batchingIdTexture"),gt.setValue(B,"batchingIdTexture",q._indirectTexture,Je),gt.setOptional(B,q,"batchingColorTexture"),q._colorsTexture!==null&&gt.setValue(B,"batchingColorTexture",q._colorsTexture,Je));let Si=J.morphAttributes;if((Si.position!==void 0||Si.normal!==void 0||Si.color!==void 0)&&ne.update(q,J,bn),(Xs||Ne.receiveShadow!==q.receiveShadow)&&(Ne.receiveShadow=q.receiveShadow,gt.setValue(B,"receiveShadow",q.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&U.environment!==null&&(gn.envMapIntensity.value=U.environmentIntensity),gn.dfgLUT!==void 0&&(gn.dfgLUT.value=S1()),Xs){if(gt.setValue(B,"toneMappingExposure",P.toneMappingExposure),Ne.needsLights&&Lb(gn,Mr),ye&&V.fog===!0&&fe.refreshFogUniforms(gn,ye),fe.refreshMaterialUniforms(gn,V,le,Ie,S.state.transmissionRenderTarget[A.id]),Ne.needsLights&&Ne.numLightProbeGrids>0){let zt=x,dn=0;for(let rs of S.state.lightProbeGridArray)rs.texture!==null&&(zt.textures[dn]=rs.texture,zt.min[dn]=rs.boundingBox.min,zt.max[dn]=rs.boundingBox.max,zt.resolution[dn]=rs.resolution,dn++);for(let rs in zt)zt[rs].length=dn;gn.probesSH.value=zt.textures,gn.probesMin.value=zt.min,gn.probesMax.value=zt.max,gn.probesResolution.value=zt.resolution}Xa.upload(B,Pm(Ne),gn,Je)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Xa.upload(B,Pm(Ne),gn,Je),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&gt.setValue(B,"center",q.center),gt.setValue(B,"modelViewMatrix",q.modelViewMatrix),gt.setValue(B,"normalMatrix",q.normalMatrix),gt.setValue(B,"modelMatrix",q.matrixWorld),V.uniformsGroups!==void 0){let zt=V.uniformsGroups;for(let dn=0,rs=zt.length;dn<rs;dn++){let Dm=zt[dn];Ve.update(Dm,bn),Ve.bind(Dm,bn)}}return bn}function Lb(A,U){A.ambientLightColor.needsUpdate=U,A.lightProbe.needsUpdate=U,A.sunLights.needsUpdate=U,A.sunLightShadows.needsUpdate=U,A.directionalLights.needsUpdate=U,A.directionalLightShadows.needsUpdate=U,A.pointLights.needsUpdate=U,A.pointLightShadows.needsUpdate=U,A.spotLights.needsUpdate=U,A.spotLightShadows.needsUpdate=U,A.rectAreaLights.needsUpdate=U,A.hemisphereLights.needsUpdate=U}function Db(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return ie},this.setRenderTargetTextures=function(A,U,J){let V=je.get(A);V.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),je.get(A.texture).__webglTexture=U,je.get(A.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:J,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,U){let J=je.get(A);J.__webglFramebuffer=U,J.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(A,U=0,J=0){ie=A,X=U,H=J;let V=null,q=!1,ye=!1;if(A){let be=je.get(A);if(be.__useDefaultFramebuffer!==void 0){Se.bindFramebuffer(B.FRAMEBUFFER,be.__webglFramebuffer),$.copy(A.viewport),ae.copy(A.scissor),he=A.scissorTest,Se.viewport($),Se.scissor(ae),Se.setScissorTest(he),j=-1;return}else if(be.__webglFramebuffer===void 0)Je.setupRenderTarget(A);else if(be.__hasExternalTextures)Je.rebindTextures(A,je.get(A.texture).__webglTexture,je.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let $e=A.depthTexture;if(be.__boundDepthTexture!==$e){if($e!==null&&je.has($e)&&(A.width!==$e.image.width||A.height!==$e.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Je.setupDepthRenderbuffer(A)}}let Re=A.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(ye=!0);let Be=je.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Be[U])?V=Be[U][J]:V=Be[U],q=!0):A.samples>0&&Je.useMultisampledRTT(A)===!1?V=je.get(A).__webglMultisampledFramebuffer:Array.isArray(Be)?V=Be[J]:V=Be,$.copy(A.viewport),ae.copy(A.scissor),he=A.scissorTest}else $.copy(Oe).multiplyScalar(le).floor(),ae.copy(et).multiplyScalar(le).floor(),he=ot;if(J!==0&&(V=z),Se.bindFramebuffer(B.FRAMEBUFFER,V)&&Se.drawBuffers(A,V),Se.viewport($),Se.scissor(ae),Se.setScissorTest(he),q){let be=je.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+U,be.__webglTexture,J)}else if(ye){let be=U;for(let Re=0;Re<A.textures.length;Re++){let Be=je.get(A.textures[Re]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Re,Be.__webglTexture,J,be)}}else if(A!==null&&J!==0){let be=je.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,be.__webglTexture,J)}j=-1};function Lm(A){let U=je.get(A);return(U.__readFormat!==A.format||U.__readType!==A.type)&&(U.__readFormat=A.format,U.__readType=A.type,U.__formatReadable=kt.textureFormatReadable(A.format),U.__typeReadable=kt.textureTypeReadable(A.type)),U}this.readRenderTargetPixels=function(A,U,J,V,q,ye,De,be=0){if(!(A&&A.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Re=je.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&De!==void 0&&(Re=Re[De],Array.isArray(Re)&&(Re=Re[0])),Re){Se.bindFramebuffer(B.FRAMEBUFFER,Re);try{let Be=A.textures[be],$e=Be.format,ft=Be.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+be);let Fe=Lm(Be);if(Fe.__formatReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Fe.__typeReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=A.width-V&&J>=0&&J<=A.height-q&&B.readPixels(U,J,V,q,de.convert($e),de.convert(ft),ye)}finally{let Be=ie!==null?je.get(ie).__webglFramebuffer:null;Se.bindFramebuffer(B.FRAMEBUFFER,Be)}}},this.readRenderTargetPixelsAsync=async function(A,U,J,V,q,ye,De,be=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Re=je.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&De!==void 0&&(Re=Re[De],Array.isArray(Re)&&(Re=Re[0])),Re)if(U>=0&&U<=A.width-V&&J>=0&&J<=A.height-q){Se.bindFramebuffer(B.FRAMEBUFFER,Re);let Be=A.textures[be],$e=Be.format,ft=Be.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+be);let Fe=Lm(Be);if(Fe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Fe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let pt=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,pt),B.bufferData(B.PIXEL_PACK_BUFFER,ye.byteLength,B.STREAM_READ),B.readPixels(U,J,V,q,de.convert($e),de.convert(ft),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let Zt=ie!==null?je.get(ie).__webglFramebuffer:null;Se.bindFramebuffer(B.FRAMEBUFFER,Zt);let Nt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await n0(B,Nt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,pt),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,ye),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(pt),B.deleteSync(Nt),ye}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,U=null,J=0){let V=Math.pow(2,-J),q=Math.floor(A.image.width*V),ye=Math.floor(A.image.height*V),De=U!==null?U.x:0,be=U!==null?U.y:0;Je.setTexture2D(A,0),B.copyTexSubImage2D(B.TEXTURE_2D,J,0,0,De,be,q,ye),Se.unbindTexture()},this.copyTextureToTexture=function(A,U,J=null,V=null,q=0,ye=0){let De,be,Re,Be,$e,ft,Fe,pt,Zt,Nt=A.isCompressedTexture?A.mipmaps[ye]:A.image;if(J!==null)De=J.max.x-J.min.x,be=J.max.y-J.min.y,Re=J.isBox3?J.max.z-J.min.z:1,Be=J.min.x,$e=J.min.y,ft=J.isBox3?J.min.z:0;else{let gt=Math.pow(2,-q);De=Math.floor(Nt.width*gt),be=Math.floor(Nt.height*gt),A.isDataArrayTexture?Re=Nt.depth:A.isData3DTexture?Re=Math.floor(Nt.depth*gt):Re=1,Be=0,$e=0,ft=0}V!==null?(Fe=V.x,pt=V.y,Zt=V.z):(Fe=0,pt=0,Zt=0);let Lt=de.convert(U.format),vn=de.convert(U.type),Ne;U.isData3DTexture?(Je.setTexture3D(U,0),Ne=B.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Je.setTexture2DArray(U,0),Ne=B.TEXTURE_2D_ARRAY):(Je.setTexture2D(U,0),Ne=B.TEXTURE_2D),Se.activeTexture(B.TEXTURE0),Se.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,U.flipY),Se.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),Se.pixelStorei(B.UNPACK_ALIGNMENT,U.unpackAlignment);let In=Se.getParameter(B.UNPACK_ROW_LENGTH),yt=Se.getParameter(B.UNPACK_IMAGE_HEIGHT),_r=Se.getParameter(B.UNPACK_SKIP_PIXELS),bn=Se.getParameter(B.UNPACK_SKIP_ROWS),ql=Se.getParameter(B.UNPACK_SKIP_IMAGES);Se.pixelStorei(B.UNPACK_ROW_LENGTH,Nt.width),Se.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Nt.height),Se.pixelStorei(B.UNPACK_SKIP_PIXELS,Be),Se.pixelStorei(B.UNPACK_SKIP_ROWS,$e),Se.pixelStorei(B.UNPACK_SKIP_IMAGES,ft);let Xs=A.isDataArrayTexture||A.isData3DTexture,Mr=U.isDataArrayTexture||U.isData3DTexture;if(A.isDepthTexture){let gt=je.get(A),gn=je.get(U),Si=je.get(gt.__renderTarget),zt=je.get(gn.__renderTarget);Se.bindFramebuffer(B.READ_FRAMEBUFFER,Si.__webglFramebuffer),Se.bindFramebuffer(B.DRAW_FRAMEBUFFER,zt.__webglFramebuffer);for(let dn=0;dn<Re;dn++)Xs&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,je.get(A).__webglTexture,q,ft+dn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,je.get(U).__webglTexture,ye,Zt+dn)),B.blitFramebuffer(Be,$e,Be+De,$e+be,Fe,pt,Fe+De,pt+be,B.DEPTH_BUFFER_BIT,B.NEAREST);Se.bindFramebuffer(B.READ_FRAMEBUFFER,null),Se.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(q!==0||A.isRenderTargetTexture||je.has(A)){let gt=je.get(A),gn=je.get(U);Se.bindFramebuffer(B.READ_FRAMEBUFFER,D),Se.bindFramebuffer(B.DRAW_FRAMEBUFFER,G);for(let Si=0;Si<Re;Si++)Xs?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,gt.__webglTexture,q,ft+Si):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,gt.__webglTexture,q),Mr?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,gn.__webglTexture,ye,Zt+Si):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,gn.__webglTexture,ye),q!==0?B.blitFramebuffer(Be,$e,Be+De,$e+be,Fe,pt,Fe+De,pt+be,B.COLOR_BUFFER_BIT,B.NEAREST):Mr?B.copyTexSubImage3D(Ne,ye,Fe,pt,Zt+Si,Be,$e,De,be):B.copyTexSubImage2D(Ne,ye,Fe,pt,Be,$e,De,be);Se.bindFramebuffer(B.READ_FRAMEBUFFER,null),Se.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Mr?A.isDataTexture||A.isData3DTexture?B.texSubImage3D(Ne,ye,Fe,pt,Zt,De,be,Re,Lt,vn,Nt.data):U.isCompressedArrayTexture?B.compressedTexSubImage3D(Ne,ye,Fe,pt,Zt,De,be,Re,Lt,Nt.data):B.texSubImage3D(Ne,ye,Fe,pt,Zt,De,be,Re,Lt,vn,Nt):A.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,ye,Fe,pt,De,be,Lt,vn,Nt.data):A.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,ye,Fe,pt,Nt.width,Nt.height,Lt,Nt.data):B.texSubImage2D(B.TEXTURE_2D,ye,Fe,pt,De,be,Lt,vn,Nt);Se.pixelStorei(B.UNPACK_ROW_LENGTH,In),Se.pixelStorei(B.UNPACK_IMAGE_HEIGHT,yt),Se.pixelStorei(B.UNPACK_SKIP_PIXELS,_r),Se.pixelStorei(B.UNPACK_SKIP_ROWS,bn),Se.pixelStorei(B.UNPACK_SKIP_IMAGES,ql),ye===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0&&B.generateMipmap(Ne),Se.unbindTexture()},this.initRenderTarget=function(A){je.get(A).__webglFramebuffer===void 0&&Je.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?Je.setTextureCube(A,0):A.isData3DTexture?Je.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Je.setTexture2DArray(A,0):Je.setTexture2D(A,0),Se.unbindTexture()},this.resetState=function(){X=0,H=0,ie=null,Se.reset(),pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}};var Ya={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var $n=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},w1=new hi(-1,1,1,-1,0,1),Pf=class extends Ct{constructor(){super(),this.setAttribute("position",new Dt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Dt([0,2,0,0,2,0],2))}},T1=new Pf,rr=class{constructor(e){this._mesh=new Et(T1,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,w1)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Gh=class extends $n{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Ut?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Xr.clone(e.uniforms),this.material=new Ut({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new rr(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var dl=class extends $n{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Vh=class extends $n{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Wh=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new He);this._width=n.width,this._height=n.height,t=new Kt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:on}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Gh(Ya),this.copyPass.material.blending=ws,this.timer=new $o}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}dl!==void 0&&(a instanceof dl?n=!0:a instanceof Vh&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new He);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var qh=class extends $n{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ee}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var B0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ee(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var Ja=class i extends $n{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new He(e.x,e.y):new He(256,256),this.clearColor=new Ee(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Kt(r,a,{type:on,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new Kt(r,a,{type:on,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new Kt(r,a,{type:on,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=B0;this.highPassUniforms=Xr.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ut({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new He(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Xr.clone(Ya.uniforms),this.blendMaterial=new Ut({uniforms:this.copyUniforms,vertexShader:Ya.vertexShader,fragmentShader:Ya.fragmentShader,premultipliedAlpha:!0,blending:el,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ee,this._oldClearAlpha=1,this._basic=new pn,this._fsQuad=new rr(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new He(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(n*n))/n);let s=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;s.push((a*o+(a+1)*l)/c),r.push(c)}return new Ut({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new He(.5,.5)},direction:{value:new He(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:r}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Ut({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Ja.BlurDirectionX=new He(1,0);Ja.BlurDirectionY=new He(0,1);var Xh=new ke,If=new ke,Lf=new C,jh=new C,fi=new C,Df=[new C,new C,new C,new C],Ff=[new C,new C,new C,new C],$a=[new C,new C,new C,new C,new C,new C,new C,new C],As=2,E1=.1,Za=class extends ir{constructor(){super(new hi(-5,5,5,-5,.5,500)),this.isSunLightShadow=!0,this.mapSize.set(1024,1024),this._cameras=[],this._matrices=[],this._frustums=[],this._cascadeSplits=new Array(As+1).fill(0),this._cascadeData=[],this._viewportCount=As,this._frameExtents.set(2,1);for(let e=0;e<As;e++)this._cameras.push(new hi),this._matrices.push(new ke),this._frustums.push(new Vi),this._cascadeData.push(new xt);for(;this._viewports.length<As;)this._viewports.push(new xt)}getCamera(e=0){return this._cameras[e]}getMatrix(e=0){return this._matrices[e]}getFrustum(e=0){return this._frustums[e]}updateMatrices(e,t){if(t===void 0)return;let n=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.x),s=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.y);for(let v=0;v<As;v++)this._viewports[v].set(v+n,s,1-2*n,1-2*s);let r=this.mapSize.x*(1-2*n),a=this.mapSize.y*(1-2*s),o=Math.min(r,a),l=this.camera,c=t.near,h=Math.max(c+1e-6,Math.min(l.far,t.far)),u=this._cascadeSplits;u[0]=c;for(let v=1;v<As;v++){let m=v/As,y=c+(h-c)*m,M=c>0?c*Math.pow(h/c,m):y;u[v]=(y+M)*.5}u[As]=h,Lf.setFromMatrixPosition(e.matrixWorld).negate().normalize(),jh.set(0,1,0),Math.abs(jh.dot(Lf))>.99&&jh.set(0,0,1),Xh.lookAt(fi.set(0,0,0),Lf,jh),If.copy(Xh).transpose().multiply(t.matrixWorld);let d=t.reversedDepth?1:t.coordinateSystem===er?0:-1,p=t.projectionMatrixInverse,g=-1/0;for(let v=0;v<4;v++){let m=v===0||v===1?1:-1,y=v===0||v===3?1:-1,M=Df[v].set(m,y,d).applyMatrix4(p),x=Ff[v];t.isPerspectiveCamera===!0?x.copy(M).multiplyScalar(h/c):x.set(M.x,M.y,-h),M.applyMatrix4(If),x.applyMatrix4(If),g=Math.max(g,M.z,x.z)}g+=h;let _=l.near;for(let v=0;v<As;v++){let m=v===0?u[0]:this._cascadeData[v-1].z,y=u[v+1],M=y-E1*(y-u[v]);this._cascadeData[v].set(v===0?-1e10:m,y,M,0);let x=(m-c)/(h-c),T=(y-c)/(h-c);fi.set(0,0,0);for(let P=0;P<4;P++)$a[P*2].lerpVectors(Df[P],Ff[P],x),$a[P*2+1].lerpVectors(Df[P],Ff[P],T),fi.add($a[P*2]).add($a[P*2+1]);fi.multiplyScalar(1/8);let S=0,b=1/0;for(let P=0;P<8;P++)S=Math.max(S,$a[P].distanceToSquared(fi)),b=Math.min(b,$a[P].z);let w=Math.sqrt(S);if(o>1){w/=1-1/o;let P=2*w/r,F=2*w/a;fi.x=Math.round(fi.x/P)*P,fi.y=Math.round(fi.y/F)*F}fi.z=g+_,fi.applyMatrix4(Xh);let L=this._cameras[v];L.position.copy(fi),L.quaternion.setFromRotationMatrix(Xh),L.left=-w,L.right=w,L.top=w,L.bottom=-w,L.near=_,L.far=g-b+2*_,L.coordinateSystem=l.coordinateSystem,L._reversedDepth=l.reversedDepth,L.updateProjectionMatrix(),L.updateMatrixWorld(),this._updateMatrix(L,this._matrices[v],this._frustums[v],this._viewports[v])}}};var Kh=class extends _s{constructor(e,t){super(e,t),this.isSunLight=!0,this.type="SunLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.shadow=new Za}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t}};var A1=3.5403451836554063,R1=4,C1=A1*R1,Nf=C1/1e3,Rs=Math.PI/180,z0=24.66,Yt=(()=>{let[i,e,t]=[.6155,.7854,.31],n=Math.cos(i),s=Math.sin(i),r=Math.cos(e),a=Math.sin(e),o=Math.cos(t),l=Math.sin(t);return[r*o,-r*l,a,s*a*o+n*l,-s*a*l+n*o,-s*r,-n*a*o+s*l,n*a*l+s*o,n*r]})();var _e=(i,e,t)=>i<e?e:i>t?t:i,it=(i,e,t)=>i+(e-i)*t,Hn=(i,e,t)=>{let n=_e((t-i)/(e-i),0,1);return n*n*(3-2*n)};var Jt=(i,e)=>1-Math.pow(.5,e/i);function Zn(i,e,t){let n=Math.imul(i,374761393)+Math.imul(e,668265263)+Math.imul(t,2147483647)|0;return n=Math.imul(n^n>>>13,1274126177),n=(n^n>>>16)>>>0,n/4294967296}function Yh(i,e,t,n){let s=Math.imul(i,2246822507)^Math.imul(e,3266489909)^Math.imul(t,668265263)^Math.imul(n,374761393)|0;return s^=s>>>15,s=Math.imul(s,739982445),s^=s>>>12,s=Math.imul(s,695872825),s^=s>>>15,s>>>0}function ar(i,e,t,n){switch(i&15){case 0:return e+t;case 1:return-e+t;case 2:return e-t;case 3:return-e-t;case 4:return e+n;case 5:return-e+n;case 6:return e-n;case 7:return-e-n;case 8:return t+n;case 9:return-t+n;case 10:return t-n;case 11:return-t-n;case 12:return e+t;case 13:return-t+n;case 14:return-e+t;default:return-t-n}}function or(i,e,t){let n=Math.imul(i,2376512323)^Math.imul(e,3625334849)^Math.imul(t,3407524639)|0;return n=Math.imul(n^n>>>15,739982445),(n^n>>>13)>>>0}function Pi(i,e,t){let n=Math.floor(i),s=Math.floor(e),r=Math.floor(t),a=i-n,o=e-s,l=t-r,c=a*a*a*(a*(a*6-15)+10),h=o*o*o*(o*(o*6-15)+10),u=l*l*l*(l*(l*6-15)+10),d=ar(or(n,s,r),a,o,l),p=ar(or(n+1,s,r),a-1,o,l),g=ar(or(n,s+1,r),a,o-1,l),_=ar(or(n+1,s+1,r),a-1,o-1,l),v=ar(or(n,s,r+1),a,o,l-1),m=ar(or(n+1,s,r+1),a-1,o,l-1),y=ar(or(n,s+1,r+1),a,o-1,l-1),M=ar(or(n+1,s+1,r+1),a-1,o-1,l-1);return it(it(it(d,p,c),it(g,_,c),h),it(it(v,m,c),it(y,M,c),h),u)}var Nn=()=>performance.now()/1e3,Uf=1337;function Qa(){return Uf=Uf*16807%2147483647,(Uf-1)/2147483646}var Jh=420,P1=`
  uniform vec3 uSun;        // unit, world
  uniform vec3 uUp;         // unit, world: straight up at the camera
  uniform float uAlt;       // camera altitude above the mean surface (m)
  uniform float uDust;      // 0 clear .. 1 thick dust storm
  uniform float uTime;
  const float PI = 3.14159265;

  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

  // colour of the sky in direction v (unit, world). Linear, scene-referred.
  vec3 skyColor(vec3 v, out float space) {
    float mu = dot(v, uUp);
    float sunE = dot(uSun, uUp);
    float cosT = dot(v, uSun);
    float day = smoothstep(-0.16, 0.10, sunE);
    float low = 1.0 - smoothstep(0.0, 0.45, sunE);           // 1 at the horizon, 0 high sun
    // base dome: zenith to horizon
    float h = pow(1.0 - clamp(mu, 0.0, 1.0), 3.0);
    vec3 zen = mix(vec3(0.270, 0.180, 0.115), vec3(0.150, 0.130, 0.125), low);
    vec3 hor = mix(vec3(0.800, 0.540, 0.330), vec3(0.40, 0.30, 0.25), low);
    vec3 col = mix(zen, hor, h) * (0.90 * day);
    // night: the faint cool light of a dusty sky under the stars, a little brighter at the horizon
    col += mix(vec3(0.0110, 0.0140, 0.0235), vec3(0.0260, 0.0290, 0.0400), h) * (1.0 - day);
    // dust aureole around the sun: warm white by day, blue when the sun is low
    float g = 0.80;
    float hg = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosT, 1.5) * 0.25;
    float wide = pow(max(cosT, 0.0), 6.0);
    vec3 aur = mix(vec3(1.0, 0.86, 0.66), vec3(0.34, 0.52, 0.92), smoothstep(0.30, 0.02, sunE));
    float sunUp = smoothstep(-0.10, 0.04, sunE);
    // near the horizon the sun shines through far more dust: the glow shrinks and dims with it
    col += aur * (hg * mix(0.30, 0.085, low) + wide * mix(0.16, 0.10, low)) * sunUp * (0.35 + 0.65 * h + 0.5 * low);
    // twilight glow hugging the horizon on the sun's side after sunset
    float tw = smoothstep(-0.34, -0.02, sunE) * (1.0 - sunUp);
    col += vec3(0.20, 0.25, 0.42) * tw * pow(max(cosT * 0.5 + 0.5, 0.0), 3.0) * (0.25 + h) * 0.55;
    // storms: flatten everything toward a dim ochre
    vec3 murk = vec3(0.50, 0.30, 0.16) * (0.03 + 0.63 * day);
    col = mix(col, murk, uDust * 0.88);
    // leaving the atmosphere: fade to space, keep a haze band along the limb
    space = 1.0 - exp(-max(uAlt, 0.0) / ${Jh.toFixed(1)});
    float camR = ${12e3.toFixed(1)} + uAlt;
    float b = camR * sqrt(max(1.0 - mu * mu, 0.0));           // closest approach of the ray to the centre
    // the air seen edge-on from above: a thin band of haze along the limb, lit only where the
    // sun reaches that part of the planet
    vec3 nearest = normalize(uUp * camR - v * (camR * mu));
    float limbLit = smoothstep(-0.12, 0.30, dot(nearest, uSun));
    float limb = (mu < 0.0 ? 1.0 : 0.0) * exp(-max(b - ${12e3.toFixed(1)}, 0.0) / ${(Jh*.3).toFixed(1)});
    vec3 fromSpace = vec3(0.78, 0.52, 0.34) * limb * limbLit * 0.95;
    // lower down, the day sky thins toward the zenith before it gives way to black
    fromSpace = max(fromSpace, col * exp(-max(uAlt, 0.0) / ${(Jh*2).toFixed(1)}) * h);
    col = mix(col, fromSpace, space);
    return col;
  }

  vec3 stars(vec3 v, float visibility) {
    if (visibility <= 0.001) return vec3(0.0);
    vec3 acc = vec3(0.0);
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 170.0 : 90.0;
      vec3 p = v * scale;
      vec3 ip = floor(p + 0.5);
      float rnd = hash13(ip + float(layer) * 17.0);
      if (rnd > (layer == 0 ? 0.965 : 0.985)) {
        vec3 c = ip + (vec3(hash13(ip + 3.1), hash13(ip + 7.7), hash13(ip + 11.3)) - 0.5) * 0.7;
        float d = length(p - normalize(c) * length(p));
        float mag = pow(hash13(ip + 23.0), layer == 0 ? 7.0 : 2.5);
        float tw = 0.85 + 0.15 * sin(uTime * (2.0 + rnd * 5.0) + rnd * 60.0);
        float s = exp(-d * d * (layer == 0 ? 220.0 : 90.0)) * (0.35 + 5.0 * mag) * tw;
        vec3 tint = mix(vec3(1.0, 0.86, 0.72), vec3(0.75, 0.86, 1.0), hash13(ip + 41.0));
        acc += tint * s;
      }
    }
    return acc * visibility;
  }
`,Of=new Ee,$h=class{constructor(){this.uniforms={uSun:{value:new C(1,0,0)},uUp:{value:new C(0,1,0)},uAlt:{value:2},uDust:{value:0},uTime:{value:0},uSunDisc:{value:1}};let e=new Ut({uniforms:this.uniforms,side:an,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!0,vertexShader:`
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * vec4((viewMatrix * vec4(position, 0.0)).xyz, 1.0);
          gl_Position = p.xyww;       // always at the far plane
        }`,fragmentShader:`
        varying vec3 vDir;
        uniform float uSunDisc;
        ${P1}
        void main() {
          vec3 v = normalize(vDir);
          float space;
          vec3 col = skyColor(v, space);
          float sunE = dot(uSun, uUp);
          float night = 1.0 - smoothstep(-0.20, 0.06, sunE);
          // stars need darkness: night, or real height above the dust (not a mountain top by day)
          float airless = smoothstep(0.80, 0.98, space);
          float starVis = max(night, airless) * (1.0 - uDust) * smoothstep(-0.06, 0.12, dot(v, uUp) + airless);
          col += stars(v, starVis) * 0.9;
          // the sun: a small hard disc (0.35 degrees across on Mars) with a tight halo
          float cosT = dot(v, uSun);
          float ang = acos(clamp(cosT, -1.0, 1.0));
          float disc = smoothstep(0.0046, 0.0030, ang);
          float halo = exp(-ang * 60.0) * 0.6 + exp(-ang * 14.0) * 0.08;
          float through = (1.0 - uDust * 0.93) * smoothstep(-0.03, 0.03, sunE);
          vec3 sunCol = mix(vec3(1.0, 0.93, 0.82), vec3(0.72, 0.84, 1.0), smoothstep(0.25, 0.0, sunE) * 0.7);
          col += sunCol * (disc * 90.0 * uSunDisc + halo * mix(6.0, 2.5, smoothstep(0.45, 0.0, sunE)) * uSunDisc) * through;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});this.mesh=new Et(new kr(1,32,16),e),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-1e3,this.mesh.name="sky",this.sunColor=new Ee,this.ambientSky=new Ee,this.ambientGround=new Ee,this.fogColor=new Ee,this.sunIntensity=1,this.day=1}update(e,t,n,s){let r=this.uniforms;r.uSun.value.copy(e),r.uUp.value.copy(t).normalize(),r.uAlt.value=t.length()-12e3,r.uDust.value=n,r.uTime.value=s,this.mesh.position.copy(t);let a=e.dot(r.uUp.value),o=Hn(-.16,.1,a),l=1-Hn(0,.45,a);this.day=o,this.sunE=a;let c=Hn(-.04,.16,a);this.sunIntensity=3.3*c*(1-n*.86),this.sunColor.setRGB(it(.8,1,1-l*.6),it(.8,.93,1-l),it(.86,.8,1-l));let h=.9*o,u=1-o;this.ambientSky.setRGB(it(.54,.28,l)*h+.019*u,it(.36,.22,l)*h+.022*u,it(.22,.19,l)*h+.032*u),this.ambientGround.setRGB(.3*h*(.3+.7*c),.15*h*(.3+.7*c),.08*h*(.3+.7*c)),this.fogColor.setRGB(it(.8,.4,l)*h+.026*u,it(.54,.3,l)*h+.029*u,it(.33,.25,l)*h+.04*u),n>0&&(Of.setRGB(.5*(.03+.63*o),.3*(.03+.63*o),.16*(.03+.63*o)),this.fogColor.lerp(Of,n*.88),this.ambientSky.lerp(Of,n*.7));let d=1-Math.exp(-Math.max(r.uAlt.value,0)/Jh);this.space=d,this.fogColor.multiplyScalar(1-d*.85)}};var I1=.12,Zh=new ke,kf=new ke,Bf=new C,Qh=new C,pi=new C,zf=[new C,new C,new C,new C],Hf=[new C,new C,new C,new C],jr=[];for(let i=0;i<8;i++)jr.push(new C);var eu=class extends Za{constructor(){super(),this.split=14}updateMatrices(e,t){if(t===void 0)return;let n=this._cameras.length,s=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.x),r=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.y);for(let d=0;d<n;d++)this._viewports[d].set(d+s,r,1-2*s,1-2*r);let a=Math.min(this.mapSize.x*(1-2*s),this.mapSize.y*(1-2*r)),o=t.near,l=Math.max(o+1e-6,Math.min(this.camera.far,t.far)),c=[o,Math.min(this.split,l*.6),l];Bf.setFromMatrixPosition(e.matrixWorld).negate().normalize(),Qh.set(0,1,0),Math.abs(Qh.dot(Bf))>.99&&Qh.set(0,0,1),Zh.lookAt(pi.set(0,0,0),Bf,Qh),kf.copy(Zh).transpose().multiply(t.matrixWorld);let h=-1/0;for(let d=0;d<4;d++){let p=d===0||d===1?1:-1,g=d===0||d===3?1:-1,_=zf[d].set(p,g,-1).applyMatrix4(t.projectionMatrixInverse),v=Hf[d].copy(_).multiplyScalar(l/o);_.applyMatrix4(kf),v.applyMatrix4(kf),h=Math.max(h,_.z,v.z)}h+=l;let u=this.camera.near;for(let d=0;d<n;d++){let p=d===0?c[0]:this._cascadeData[d-1].z,g=c[d+1],_=g-I1*(g-c[d]);this._cascadeData[d].set(d===0?-1e10:p,g,_,0);let v=(p-o)/(l-o),m=(g-o)/(l-o);pi.set(0,0,0);for(let S=0;S<4;S++)jr[S*2].lerpVectors(zf[S],Hf[S],v),jr[S*2+1].lerpVectors(zf[S],Hf[S],m),pi.add(jr[S*2]).add(jr[S*2+1]);pi.multiplyScalar(1/8);let y=0,M=1/0;for(let S=0;S<8;S++)y=Math.max(y,jr[S].distanceToSquared(pi)),M=Math.min(M,jr[S].z);let x=Math.sqrt(y);if(a>1){x/=1-1/a;let S=2*x/a;pi.x=Math.round(pi.x/S)*S,pi.y=Math.round(pi.y/S)*S}pi.z=h+u,pi.applyMatrix4(Zh);let T=this._cameras[d];T.position.copy(pi),T.quaternion.setFromRotationMatrix(Zh),T.left=-x,T.right=x,T.top=x,T.bottom=-x,T.near=u,T.far=h-M+2*u,T.coordinateSystem=this.camera.coordinateSystem,T._reversedDepth=this.camera.reversedDepth,T.updateProjectionMatrix(),T.updateMatrixWorld(),this._updateMatrix(T,this._matrices[d],this._frustums[d],this._viewports[d])}}};var H0={low:{scale:.6,msaa:0,shadow:1024,shadowRange:30,shadowSplit:10,bloom:!1,grid:24,maxLevel:8,split:1,fine:!1,workers:2,rocks:.5,terrainShadowLevels:0},medium:{scale:.8,msaa:2,shadow:2048,shadowRange:80,shadowSplit:13,bloom:!0,grid:32,maxLevel:8,split:1.15,fine:!0,workers:2,rocks:.8,terrainShadowLevels:0},high:{scale:1,msaa:4,shadow:2048,shadowRange:110,shadowSplit:14,bloom:!0,grid:32,maxLevel:9,split:1.3,fine:!0,workers:3,rocks:1,terrainShadowLevels:1},ultra:{scale:1,msaa:4,shadow:4096,shadowRange:150,shadowSplit:18,bloom:!0,grid:48,maxLevel:9,split:1.6,fine:!0,workers:4,rocks:1.3,terrainShadowLevels:2}},L1=`
  #include <common>
  #include <tonemapping_pars_fragment>
  uniform sampler2D tDiffuse;
  uniform float uExposure, uTime, uVignette, uGrain, uSaturation, uDanger, uCold, uFade;
  uniform vec3 uTint;
  varying vec2 vUv;
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  void main() {
    vec3 col = texture2D(tDiffuse, vUv).rgb * uExposure;
    // scene-referred grade
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(lum), col, uSaturation) * uTint;
    col = ACESFilmicToneMapping(col / toneMappingExposure);
    // display-referred finishing
    vec2 q = vUv - 0.5;
    float r2 = dot(q, q);
    col *= 1.0 - uVignette * smoothstep(0.10, 0.75, r2);
    col = mix(col, vec3(0.45, 0.02, 0.0) * (0.4 + lum), uDanger * smoothstep(0.08, 0.55, r2));
    col = mix(col, vec3(0.55, 0.75, 1.0), uCold * smoothstep(0.16, 0.62, r2) * 0.55);
    col = sRGBTransferOETF(vec4(col, 1.0)).rgb;
    float n = hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5;
    col += n * (uGrain + 1.0 / 255.0);
    col *= 1.0 - uFade;
    gl_FragColor = vec4(col, 1.0);
  }`,Gf=class extends $n{constructor(){super(),this.uniforms={tDiffuse:{value:null},uExposure:{value:1},uTime:{value:0},uVignette:{value:.32},uGrain:{value:.018},uSaturation:{value:1.06},uTint:{value:new C(1,1,1)},uDanger:{value:0},uCold:{value:0},uFade:{value:0}},this.material=new Ut({uniforms:this.uniforms,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:L1,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.quad=new rr(this.material)}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(this.renderToScreen?null:t),this.quad.render(e)}dispose(){this.material.dispose(),this.quad.dispose()}},G0=new C,V0=new C,tu=class{constructor(e,t){this.qualityName=t,this.q=H0[t]||H0.medium;let n=this.renderer=new Bh({antialias:!1,powerPreference:"high-performance",stencil:!1,alpha:!1});n.outputColorSpace=Ht,n.toneMapping=ui,n.shadowMap.enabled=!0,n.shadowMap.type=qc,n.domElement.className="mg-three",e.insertBefore(n.domElement,e.firstChild),this.dpr=Math.min(window.devicePixelRatio||1,2),this.dynScale=1,this.scene=new Ca,this.camera=new sn(60,1,.12,6e4),this.scene.add(this.camera),this.sky=new $h,this.scene.add(this.sky.mesh),this.sky.mesh.onBeforeRender=()=>{let o=this.renderer.info.render;this._shadowMark||(this._shadowMark={calls:o.calls,triangles:o.triangles})},this.scene.fog=new Do(13208155,.0012),this.sunDir=new C(1,0,0),this.sun=new Kh(16777215,3),this.sun.shadow.dispose();let s=this.sun.shadow=new eu;this.sun.castShadow=!0,s.mapSize.set(this.q.shadow,this.q.shadow),s.camera.near=1,s.camera.far=this.q.shadowRange,s.split=this.q.shadowSplit,s.bias=-2e-4,s.normalBias=.022,s.radius=1.6,this.scene.add(this.sun),this.hemi=new Xo(16777215,16777215,1),this.scene.add(this.hemi);let r=n.getDrawingBufferSize(new He),a=new Kt(Math.max(1,r.x),Math.max(1,r.y),{type:on,samples:this.q.msaa});this.composer=new Wh(n,a),this.renderPass=new qh(this.scene,this.camera),this.composer.addPass(this.renderPass),this.q.bloom&&(this.bloom=new Ja(new He(256,256),.22,.55,1.15),this.composer.addPass(this.bloom)),this.final=new Gf,this.composer.addPass(this.final),this.pmrem=new ja(n),this.envScene=new Ca,this.envSky=new Et(this.sky.mesh.geometry,this.sky.mesh.material),this.envSky.frustumCulled=!1,this.envGround=new Et(new kr(40,24,8,0,Math.PI*2,Math.PI*.5,Math.PI*.5),new pn({color:8405024,side:an,fog:!1,toneMapped:!1})),this.envScene.add(this.envSky,this.envGround),this.env={target:null,sunE:9,dust:9,up:new C,age:9},this.exposure=1,this.snapLight=3,this.time=0,this.resize(),window.addEventListener("resize",()=>this.resize()),window.visualViewport&&window.visualViewport.addEventListener("resize",()=>this.resize())}resize(){let e=window.innerWidth,t=window.innerHeight,n=this.dpr*this.q.scale*this.dynScale;this.renderer.setPixelRatio(n),this.renderer.setSize(e,t),this.composer.setPixelRatio(n),this.composer.setSize(e,t),this.camera.aspect=e/t,this.baseFov=_e(2*Math.atan(Math.tan(88*Math.PI/360)/this.camera.aspect)*180/Math.PI,46,66),this.camera.updateProjectionMatrix()}adaptResolution(e,t){let n=this.dynScale;e>t*1.18?n=Math.max(.55,n-.05):e<t*.82&&(n=Math.min(1,n+.03)),Math.abs(n-this.dynScale)>.001&&(this.dynScale=n,this.resize())}update(e){let t=this.camera,n=this.sky;this.time+=e.dt,n.update(this.sunDir,t.position,e.dust||0,this.time);let s=n.sunIntensity<.02;this.sun.color.copy(n.sunColor),this.sun.intensity=e.sealed?0:Math.max(n.sunIntensity,0),V0.copy(e.focus||t.position).normalize(),this.sun.position.copy(this.sunDir),this.sun.updateMatrixWorld(),this.sun.shadow.autoUpdate=!(s||e.sealed),this.indoor=it(this.indoor||0,e.inside?1:0,Jt(.35,e.dt||.016));let r=e.power===!1?.08:1;this.hemi.color.setRGB(.5*r,.46*r,.4*r),this.hemi.groundColor.setRGB(.26*r,.24*r,.21*r),this.hemi.intensity=this.indoor,this.hemi.position.copy(V0),this._updateEnvironment(e.dt||.016,e.dust||0),this.scene.environmentIntensity=it(1.2,.12,this.indoor);let a=this.scene.fog;a.color.copy(n.fogColor);let o=Math.max(0,t.position.length()-12e3),l=e.dust||0;a.density=(85e-5+.006*l+.031*l*l)*Math.exp(-o/500)+15e-7;let c=1-Hn(.03,.55,n.sunE),h=Math.max(0,G0.set(0,0,-1).applyQuaternion(t.quaternion).dot(this.sunDir)),u=Hn(.35,.95,h)*Hn(-.12,.05,n.sunE),d=it(1.08,.92,Hn(.62,1,n.sunE))*(1+.55*c*(1-.9*u)),p=(e.inside?.95:it(2.3*(1-.45*u),d,n.day))*(e.exposureBias||1);this.exposure=this.snapLight>0?p:it(this.exposure,p,Jt(.9,e.dt)),this.snapLight>0&&this.snapLight--;let g=this.final.uniforms;g.uExposure.value=this.exposure,g.uTime.value=this.time,t.near=o>400?2:.12,t.far=6e4}_updateEnvironment(e,t){let n=this.env,s=this.sky;n.age+=e;let r=s.uniforms.uUp.value,a=Math.abs(s.sunE-n.sunE)>.012||Math.abs(t-n.dust)>.04||r.distanceToSquared(n.up)>4e-4;if(n.target&&!(this.snapLight>0&&a)&&(!a||n.age<1.2))return;n.sunE=s.sunE,n.dust=t,n.up.copy(r),n.age=0;let o=s.sunIntensity*Math.max(s.sunE,0)/Math.PI;this.envGround.material.color.setRGB(.42*(o*s.sunColor.r+s.ambientSky.r*.6),.21*(o*s.sunColor.g+s.ambientSky.g*.6),.11*(o*s.sunColor.b+s.ambientSky.b*.6)),this.envGround.quaternion.setFromUnitVectors(G0.set(0,1,0),r);let l=s.uniforms.uSunDisc.value;s.uniforms.uSunDisc.value=.25;let c=n.target;n.target=this.pmrem.fromScene(this.envScene,0,.1,100,{size:this.q.scale<.7?64:128}),s.uniforms.uSunDisc.value=l,this.scene.environment=n.target.texture,c&&c.dispose()}render(){let e=this.renderer.info;e.autoReset=!1,e.reset(),this._shadowMark=null,this.composer.render();let t=this._shadowMark||{calls:0,triangles:0};this.frameStats={calls:e.render.calls,triangles:e.render.triangles,shadowCalls:t.calls,shadowTriangles:t.triangles}}info(){let e=this.renderer.info,t=this.frameStats||{calls:0,triangles:0};return{calls:t.calls,triangles:t.triangles,shadowCalls:t.shadowCalls,shadowTriangles:t.shadowTriangles,geometries:e.memory.geometries,textures:e.memory.textures,scale:+(this.q.scale*this.dynScale).toFixed(2)}}};var mi=Uint8Array,eo=Uint16Array,D1=Int32Array,W0=new mi([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),q0=new mi([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),F1=new mi([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),X0=function(i,e){for(var t=new eo(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var s=new D1(t[30]),n=1;n<30;++n)for(var r=t[n];r<t[n+1];++r)s[r]=r-t[n]<<5|n;return{b:t,r:s}},j0=X0(W0,2),K0=j0.b,N1=j0.r;K0[28]=258,N1[258]=28;var Y0=X0(q0,0),U1=Y0.b,HR=Y0.r,qf=new eo(32768);for(_t=0;_t<32768;++_t)Cs=(_t&43690)>>1|(_t&21845)<<1,Cs=(Cs&52428)>>2|(Cs&13107)<<2,Cs=(Cs&61680)>>4|(Cs&3855)<<4,qf[_t]=((Cs&65280)>>8|(Cs&255)<<8)>>1;var Cs,_t,fl=(function(i,e,t){for(var n=i.length,s=0,r=new eo(e);s<n;++s)i[s]&&++r[i[s]-1];var a=new eo(e);for(s=1;s<e;++s)a[s]=a[s-1]+r[s-1]<<1;var o;if(t){o=new eo(1<<e);var l=15-e;for(s=0;s<n;++s)if(i[s])for(var c=s<<4|i[s],h=e-i[s],u=a[i[s]-1]++<<h,d=u|(1<<h)-1;u<=d;++u)o[qf[u]>>l]=c}else for(o=new eo(n),s=0;s<n;++s)i[s]&&(o[s]=qf[a[i[s]-1]++]>>15-i[s]);return o}),pl=new mi(288);for(_t=0;_t<144;++_t)pl[_t]=8;var _t;for(_t=144;_t<256;++_t)pl[_t]=9;var _t;for(_t=256;_t<280;++_t)pl[_t]=7;var _t;for(_t=280;_t<288;++_t)pl[_t]=8;var _t,J0=new mi(32);for(_t=0;_t<32;++_t)J0[_t]=5;var _t;var O1=fl(pl,9,1);var k1=fl(J0,5,1),Vf=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},Ii=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},Wf=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},B1=function(i){return(i+7)/8|0},z1=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new mi(i.subarray(e,t))};var H1=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Li=function(i,e,t){var n=new Error(e||H1[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,Li),!t)throw n;return n},G1=function(i,e,t,n){var s=i.length,r=n?n.length:0;if(!s||e.f&&!e.l)return t||new mi(0);var a=!t,o=a||e.i!=2,l=e.i;a&&(t=new mi(s*3));var c=function(Oe){var et=t.length;if(Oe>et){var ot=new mi(Math.max(et*2,Oe));ot.set(t),t=ot}},h=e.f||0,u=e.p||0,d=e.b||0,p=e.l,g=e.d,_=e.m,v=e.n,m=s*8;do{if(!p){h=Ii(i,u,1);var y=Ii(i,u+1,3);if(u+=3,y)if(y==1)p=O1,g=k1,_=9,v=5;else if(y==2){var S=Ii(i,u,31)+257,b=Ii(i,u+10,15)+4,w=S+Ii(i,u+5,31)+1;u+=14;for(var L=new mi(w),P=new mi(19),F=0;F<b;++F)P[F1[F]]=Ii(i,u+F*3,7);u+=b*3;for(var O=Vf(P),z=(1<<O)-1,D=fl(P,O,1),F=0;F<w;){var G=D[Ii(i,u,z)];u+=G&15;var M=G>>4;if(M<16)L[F++]=M;else{var X=0,H=0;for(M==16?(H=3+Ii(i,u,3),u+=2,X=L[F-1]):M==17?(H=3+Ii(i,u,7),u+=3):M==18&&(H=11+Ii(i,u,127),u+=7);H--;)L[F++]=X}}var ie=L.subarray(0,S),j=L.subarray(S);_=Vf(ie),v=Vf(j),p=fl(ie,_,1),g=fl(j,v,1)}else Li(1);else{var M=B1(u)+4,x=i[M-4]|i[M-3]<<8,T=M+x;if(T>s){l&&Li(0);break}o&&c(d+x),t.set(i.subarray(M,T),d),e.b=d+=x,e.p=u=T*8,e.f=h;continue}if(u>m){l&&Li(0);break}}o&&c(d+131072);for(var K=(1<<_)-1,$=(1<<v)-1,ae=u;;ae=u){var X=p[Wf(i,u)&K],he=X>>4;if(u+=X&15,u>m){l&&Li(0);break}if(X||Li(2),he<256)t[d++]=he;else if(he==256){ae=u,p=null;break}else{var Y=he-254;if(he>264){var F=he-257,re=W0[F];Y=Ii(i,u,(1<<re)-1)+K0[F],u+=re}var ve=g[Wf(i,u)&$],Ie=ve>>4;ve||Li(3),u+=ve&15;var j=U1[Ie];if(Ie>3){var re=q0[Ie];j+=Wf(i,u)&(1<<re)-1,u+=re}if(u>m){l&&Li(0);break}o&&c(d+131072);var le=d+Y;if(d<j){var qe=r-j,bt=Math.min(j,le);for(qe+d<0&&Li(3);d<bt;++d)t[d]=n[qe+d]}for(;d<le;++d)t[d]=t[d-j]}}e.l=p,e.p=ae,e.b=d,e.f=h,p&&(h=1,e.m=_,e.d=g,e.n=v)}while(!h);return d!=t.length&&a?z1(t,0,d):t.subarray(0,d)};var V1=new mi(0);var W1=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&Li(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&Li(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function nu(i,e){return G1(i.subarray(W1(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var q1=typeof TextDecoder<"u"&&new TextDecoder,X1=0;try{q1.decode(V1,{stream:!0}),X1=1}catch{}var ml=Math.PI/4,$0=4/Math.PI,ru=1.5;function Z0(i){let e=new Uint8Array(i),t=new DataView(i);if(String.fromCharCode(e[0],e[1],e[2],e[3])!=="MH01")throw new Error("Not a Mars height file");let n=t.getUint32(4,!0),s=JSON.parse(new TextDecoder().decode(e.subarray(8,8+n))),r=8+n,a=s.n+2*s.pad,o=[];for(let c of s.faces){let h=nu(e.subarray(r,r+c.lo));r+=c.lo;let u=nu(e.subarray(r,r+c.hi));r+=c.hi;let d=new Int16Array(a*a);for(let p=0,g=0;p<a;p++)for(let _=0;_<a;_++,g++){let v=h[g]|u[g]<<8,m=v>>>1^-(v&1),y;if(p===0)y=_===0?0:d[g-1];else if(_===0)y=d[g-a];else{let M=d[g-1],x=d[g-a],T=d[g-a-1],S=M<x?M:x,b=M<x?x:M;y=T>=b?S:T<=S?b:M+x-T}d[g]=y+m}o.push(d)}let l=null;if(s.rough){l={m:s.rough.m,pad:s.rough.pad,faces:[]};for(let c of s.rough.sizes)l.faces.push(nu(e.subarray(r,r+c))),r+=c}return{n:s.n,pad:s.pad,q:s.q,faces:o,rough:l}}function io(i,e,t,n){let s=e===1?1:e===-1?-1:Math.tan(e*ml),r=t===1?1:t===-1?-1:Math.tan(t*ml),a,o,l;switch(i){case 0:a=1,o=-r,l=-s;break;case 1:a=-1,o=-r,l=s;break;case 2:a=s,o=1,l=r;break;case 3:a=s,o=-1,l=-r;break;case 4:a=s,o=-r,l=1;break;default:a=-s,o=-r,l=-1}let c=1/Math.sqrt(a*a+o*o+l*l);return n[0]=a*c,n[1]=o*c,n[2]=l*c,n}var Ji=0,to=0,no=0,Di=0,Fi=0;function Xf(i,e,t){let n=i<0?-i:i,s=e<0?-e:e,r=t<0?-t:t;n>=s&&n>=r?i>0?(Ji=0,Di=-t/n,Fi=-e/n):(Ji=1,Di=t/n,Fi=-e/n):s>=r?e>0?(Ji=2,Di=i/s,Fi=t/s):(Ji=3,Di=i/s,Fi=-t/s):t>0?(Ji=4,Di=i/r,Fi=-e/r):(Ji=5,Di=-i/r,Fi=-e/r),to=Math.atan(Di)*$0,no=Math.atan(Fi)*$0}var j1=[64,32,16,8],iu=12e3*ml,su=class{constructor(e){this.n=e.n,this.pad=e.pad,this.size=e.n+2*e.pad,this.faces=e.faces,this.unit=e.q*Nf,this.rough=e.rough,this.rsize=e.rough?e.rough.m+2*e.rough.pad:0,this.pads=[]}addPad(e,t,n,s,r){let a=this.radius(e,t,n,12),o={x:e,y:t,z:n,r:s,blend:r,h:a,cos:Math.cos((s+r)/12e3)};return this.pads.push(o),o}_pad(e,t,n,s){let r=this.pads;for(let a=0;a<r.length;a++){let o=r[a],l=e*o.x+t*o.y+n*o.z;if(l<=o.cos)continue;let c=Math.sqrt(Math.max(0,2-2*l))*12e3;if(c>=o.r+o.blend)continue;let h=c<=o.r?1:1-(c-o.r)/o.blend;h=h*h*(3-2*h),s+=(o.h-s)*h}return s}elevationMetres(e,t,n){return Xf(e,t,n),this._mola()/Nf}roughness(e,t,n){return Xf(e,t,n),this._rough()}radius(e,t,n,s=ru){Xf(e,t,n);let r=this._mola(),a=this._rough(),o=12e3+r+this._detail(e,t,n,a,s);return this.pads.length?this._pad(e,t,n,o):o}radiusFace(e,t,n,s,r,a,o){Ji=e,to=t,no=n,Di=Math.tan(t*ml),Fi=Math.tan(n*ml);let l=this._mola(),c=this._rough(),h=12e3+l+this._detail(s,r,a,c,o);return this.pads.length?this._pad(s,r,a,h):h}_mola(){let e=this.n,t=this.size,n=this.faces[Ji],s=(to+1)*.5*e-.5+this.pad,r=(no+1)*.5*e-.5+this.pad;s<1?s=1:s>t-2.0001&&(s=t-2.0001),r<1?r=1:r>t-2.0001&&(r=t-2.0001);let a=Math.floor(s),o=Math.floor(r),l=s-a,c=r-o,h=l*l,u=h*l,d=c*c,p=d*c,g=(-u+2*h-l)*.5,_=(3*u-5*h+2)*.5,v=(-3*u+4*h+l)*.5,m=(u-h)*.5,y=(-p+2*d-c)*.5,M=(3*p-5*d+2)*.5,x=(-3*p+4*d+c)*.5,T=(p-d)*.5,S=(o-1)*t+a-1,b=n[S]*g+n[S+1]*_+n[S+2]*v+n[S+3]*m;S+=t;let w=n[S]*g+n[S+1]*_+n[S+2]*v+n[S+3]*m;S+=t;let L=n[S]*g+n[S+1]*_+n[S+2]*v+n[S+3]*m;S+=t;let P=n[S]*g+n[S+1]*_+n[S+2]*v+n[S+3]*m;return(b*y+w*M+L*x+P*T)*this.unit}_rough(){let e=this.rough;if(!e)return .35;let t=e.m,n=this.rsize,s=e.faces[Ji],r=(to+1)*.5*t-.5+e.pad,a=(no+1)*.5*t-.5+e.pad,o=Math.floor(r),l=Math.floor(a);o<0?o=0:o>n-2&&(o=n-2),l<0?l=0:l>n-2&&(l=n-2);let c=_e(r-o,0,1),h=_e(a-l,0,1),u=l*n+o,d=s[u]+(s[u+1]-s[u])*c,p=s[u+n]+(s[u+n+1]-s[u+n])*c;return(d+(p-d)*h)/255}_detail(e,t,n,s,r){let a=e*12e3,o=t*12e3,l=n*12e3,c=.8+7*s*s,h=0,u=96,d=c;for(let S=0;S<6&&!(u<=r);S++){let b=u>=2*r?1:(u-r)/r,w=1/u,L=Pi(a*w+S*19.19,o*w-S*7.3,l*w+S*3.7);(S===1||S===2)&&(L=(1-Math.abs(L)*1.6)*.7-.2),h+=L*d*b,u*=.5,d*=.52}if(r<14&&s<.42){let S=Pi(a/700+31.7,o/700,l/700-12.9);if(S>.05){let b=_e((S-.05)*4,0,1)*_e((.42-s)*6,0,1),w=r<=7?1:(14-r)/7,L=Math.asin(_e(t,-1,1))*12e3,P=Pi(a/55,o/55,l/55)*9+Pi(a/17+5,o/17,l/17)*2.2,F=(L+P)/15,O=Math.abs(F-Math.floor(F)-.5)*2;if(h+=(1-Math.pow(O,.75))*1.15*b*w,r<2.5){let z=(L*1.03+P*.35)/2.4;h+=(.5-Math.abs(z-Math.floor(z)-.5))*.12*b}}}let p=1+Di*Di,g=1+Fi*Fi,_=p+g-1,v=iu*p*Math.sqrt(g)/_,m=iu*g*Math.sqrt(p)/_,y=v*v,M=m*m,x=-v*m*Di*Fi/Math.sqrt(p*g),T=.1+.5*s;for(let S=0;S<4;S++){let b=j1[S];if(b<=r)break;let w=b>=2*r?1:(b-r)/r,L=4*b/iu,P=to/L,F=no/L,O=Math.floor(P),z=Math.floor(F);for(let D=-1;D<=1;D++)for(let G=-1;G<=1;G++){let X=O+G,H=z+D,ie=Yh(X,H,Ji,S+11);if((ie&1023)/1023>T)continue;let j=(ie>>>10&1023)/1023*.5+.25,K=(ie>>>20&1023)/1023*.5+.25,$=(X+j)*L,ae=(H+K)*L,he=b*(.5+.5*(ie>>>5&31)/31),Y=1-he*2.1/iu;if($>Y||$<-Y||ae>Y||ae<-Y)continue;let re=to-$,ve=no-ae,Ie=(y*re*re+2*x*re*ve+M*ve*ve)/(he*he);if(Ie>=4)continue;let le=.18+.82*Math.pow((ie>>>15&31)/31,2.2),qe=he*.36*le,bt=he*.075*le,Oe;if(Ie<1)Oe=(bt+qe)*Math.pow(Ie,1.15)-qe;else{let et=Math.sqrt(Ie),ot=2-et;Oe=bt*ot*ot*ot/(et*et)}h+=Oe*w}}return h}};var K1=new URL(".",import.meta.url),lr=i=>new URL(i,K1).href;async function Y1(i,e){let t=await fetch(i);if(!t.ok)throw new Error(`Could not load ${i} (${t.status})`);let n=Number(t.headers.get("content-length"))||0;if(!t.body||!n){let o=await t.arrayBuffer();return e&&e(1),o}let s=t.body.getReader(),r=new Uint8Array(n),a=0;for(;;){let{done:o,value:l}=await s.read();if(o)break;if(a+l.length>r.length){let c=new Uint8Array(a+l.length);c.set(r.subarray(0,a)),c.set(l,a);let h=new Uint8Array(await new Response(s.stream?s.stream:t.body).arrayBuffer().catch(()=>new ArrayBuffer(0))),u=new Uint8Array(c.length+h.length);return u.set(c),u.set(h,c.length),u.buffer}r.set(l,a),a+=l.length,e&&e(a/n)}return r.buffer.slice(0,a)}function J1(i){return new Promise((e,t)=>{let n=new Image;n.decoding="async",n.onload=()=>e(n),n.onerror=()=>t(new Error(`Could not load ${i}`)),n.src=i})}function $1(i,e){let t=i.naturalWidth/3,n=Math.min(t,e||t),s=[];for(let a=0;a<6;a++){let o=document.createElement("canvas");o.width=o.height=n,o.getContext("2d").drawImage(i,a%3*t,Math.floor(a/3)*t,t,t,0,0,n,n),s.push(o)}let r=new Ur(s);return r.colorSpace=Ht,r.generateMipmaps=!0,r.minFilter=Sn,r.magFilter=Gt,r.needsUpdate=!0,r}async function Q0(i,e={}){let t=(c,h)=>{i&&i(c,h)},n=J1(lr("assets/mars/color.jpg")),s=await Y1(lr("assets/mars/height.bin"),c=>t(c*.8,"Receiving orbital survey"));t(.82,"Unpacking elevation"),await new Promise(c=>setTimeout(c,0));let r=Z0(s),a=new su(r);t(.9,"Loading colour survey");let o=await n,l=$1(o,e.maxColorFace);return t(1,"Ready"),{planet:a,heightData:r,albedoCube:l}}var ev=Math.PI/4,so=64,Mt=[0,0,0];function Z1(i,e){return 2/(1<<i)*12e3*ev/e}function jf(i){return 2/(1<<i)*12e3*ev}function Kf(i,e,t,n,s,r,a){let o=Z1(t,r),l=Math.max(ru,o*1.25),c=r+3,h=new Float64Array(c*c),u=new Float64Array(c*c),d=new Float64Array(c*c),p=1/0,g=-1/0,_=r<<t,v=2/_,m=n*r-1,y=s*r-1;for(let K=0,$=0;K<c;K++){let ae=y+K,he=ae===0?-1:ae===_?1:-1+ae*v;for(let Y=0;Y<c;Y++,$++){let re=m+Y,ve=re===0?-1:re===_?1:-1+re*v;io(e,ve,he,Mt);let le=re<=0||re>=_||ae<=0||ae>=_?i.radius(Mt[0],Mt[1],Mt[2],l):i.radiusFace(e,ve,he,Mt[0],Mt[1],Mt[2],l);h[$]=Mt[0]*le,u[$]=Mt[1]*le,d[$]=Mt[2]*le,Y>0&&K>0&&Y<c-1&&K<c-1&&(le<p&&(p=le),le>g&&(g=le))}}let M=(r/2+1)*c+(r/2+1),x=h[M],T=u[M],S=d[M],b=Math.floor((Yt[0]*x+Yt[1]*T+Yt[2]*S)/so)*so,w=Math.floor((Yt[3]*x+Yt[4]*T+Yt[5]*S)/so)*so,L=Math.floor((Yt[6]*x+Yt[7]*T+Yt[8]*S)/so)*so,P=(r+1)*(r+1),F=4*r,O=new Float32Array((P+F)*3),z=new Int8Array((P+F)*3),D=new Float32Array((P+F)*3),G=0;for(let K=0,$=0;K<=r;K++)for(let ae=0;ae<=r;ae++,$++){let he=(K+1)*c+(ae+1),Y=h[he],re=u[he],ve=d[he],Ie=Y-x,le=re-T,qe=ve-S;O[$*3]=Ie,O[$*3+1]=le,O[$*3+2]=qe,D[$*3]=Yt[0]*Y+Yt[1]*re+Yt[2]*ve-b,D[$*3+1]=Yt[3]*Y+Yt[4]*re+Yt[5]*ve-w,D[$*3+2]=Yt[6]*Y+Yt[7]*re+Yt[8]*ve-L;let bt=Ie*Ie+le*le+qe*qe;bt>G&&(G=bt);let Oe=h[he+1]-h[he-1],et=u[he+1]-u[he-1],ot=d[he+1]-d[he-1],lt=h[he+c]-h[he-c],$t=u[he+c]-u[he-c],Wt=d[he+c]-d[he-c],hn=$t*ot-Wt*et,It=Wt*Oe-lt*ot,On=lt*et-$t*Oe,qt=127/Math.sqrt(hn*hn+It*It+On*On);z[$*3]=Math.round(hn*qt),z[$*3+1]=Math.round(It*qt),z[$*3+2]=Math.round(On*qt)}let X=o*2+.5,H=P,ie=(K,$)=>{let ae=$*(r+1)+K,he=($+1)*c+(K+1),Y=Math.sqrt(h[he]*h[he]+u[he]*u[he]+d[he]*d[he]),re=X/Y;O[H*3]=O[ae*3]-h[he]*re,O[H*3+1]=O[ae*3+1]-u[he]*re,O[H*3+2]=O[ae*3+2]-d[he]*re,z[H*3]=z[ae*3],z[H*3+1]=z[ae*3+1],z[H*3+2]=z[ae*3+2],D[H*3]=D[ae*3],D[H*3+1]=D[ae*3+1],D[H*3+2]=D[ae*3+2],H++};for(let K=0;K<r;K++)ie(K,0);for(let K=0;K<r;K++)ie(r,K);for(let K=r;K>0;K--)ie(K,r);for(let K=r;K>0;K--)ie(0,K);let j={pos:O,nor:z,tex:D,origin:[x,T,S],radius:Math.sqrt(G)+X,minR:p,maxR:g};return a&&(j.rocks=Q1(i,e,t,n,s,a,x,T,S)),j}function tv(i){let e=[],t=(a,o)=>o*(i+1)+a;for(let a=0;a<i;a++)for(let o=0;o<i;o++){let l=t(o,a),c=t(o+1,a),h=t(o,a+1),u=t(o+1,a+1);e.push(l,h,c,c,h,u)}let n=(i+1)*(i+1),s=[];for(let a=0;a<i;a++)s.push(t(a,0));for(let a=0;a<i;a++)s.push(t(i,a));for(let a=i;a>0;a--)s.push(t(a,i));for(let a=i;a>0;a--)s.push(t(0,a));let r=s.length;for(let a=0;a<r;a++){let o=s[a],l=s[(a+1)%r],c=n+a,h=n+(a+1)%r;e.push(o,l,c,l,h,c)}return new Uint16Array(e)}function Q1(i,e,t,n,s,r,a,o,l){let c=2/(1<<t),h=-1+n*c,u=-1+s*c,d=jf(t);io(e,h+c/2,u+c/2,Mt);let p=i.roughness(Mt[0],Mt[1],Mt[2]),g=Pi(Mt[0]*12e3/260+7.7,Mt[1]*12e3/260,Mt[2]*12e3/260-3.1),_=Math.min(1,Math.max(0,(g+.15)*1.8)),v=Math.abs(Mt[1]),m=r==="big"?(8e-4+.0075*p*p)*(.15+.85*_):(.03+.13*p)*(.35+.65*_);v>.97&&(m*=.15);let y=Math.min(r==="big"?120:230,Math.floor(d*d*m)),M=new Float32Array(y*8),x=Yh(n,s,e,t*7+(r==="big"?1:2)),T=()=>{x=x+1831565813|0;let w=Math.imul(x^x>>>15,1|x);return w=w+Math.imul(w^w>>>7,61|w)^w,((w^w>>>14)>>>0)/4294967296},S=0,b=i.pads;for(let w=0;w<y;w++){let L=h+T()*c,P=u+T()*c,F=T(),O=T();io(e,L,P,Mt);let z=!0;for(let X=0;X<b.length;X++){let H=b[X],ie=r==="big"?H.r+H.blend*.35:Math.min(H.r,15);if(Mt[0]*H.x+Mt[1]*H.y+Mt[2]*H.z>Math.cos(ie/12e3)){z=!1;break}}if(!z)continue;let D=r==="big"?Math.min(4.2,.42*Math.pow(1-F*.985,-.5)):.09+.36*F*F,G=i.radiusFace(e,L,P,Mt[0],Mt[1],Mt[2],ru)-D*.08;M[S++]=Mt[0]*G-a,M[S++]=Mt[1]*G-o,M[S++]=Mt[2]*G-l,M[S++]=Mt[0],M[S++]=Mt[1],M[S++]=Mt[2],M[S++]=D,M[S++]=O}return S===M.length?M:M.slice(0,S)}var au=[0,0,0],ew=new C,Kr=class{constructor(e,t,n,s,r){this.face=e,this.level=t,this.ix=n,this.iy=s,this.parent=r,this.children=null,this.mesh=null,this.state=0,this.used=0;let a=2/(1<<t);io(e,-1+(n+.5)*a,-1+(s+.5)*a,au),this.dir=new C(au[0],au[1],au[2]),this.center=this.dir.clone().multiplyScalar(12e3),this.size=jf(t),this.radius=this.size*.75,this.angle=this.size*.71/12e3,this.maxR=r?r.maxR+6:12320}},ou=class{constructor(e){this.planet=e.planet,this.parent=e.parent,this.material=e.material,this.G=e.grid||32,this.maxLevel=e.maxLevel||9,this.split=e.split||2.4,this.shadowLevel=e.shadowLevel===void 0?7:e.shadowLevel,this.rockLevels={big:Math.min(7,this.maxLevel-1),small:this.maxLevel},this.index=new nt(tv(this.G),1),this.roots=[];for(let n=0;n<6;n++)this.roots.push(new Kr(n,0,0,0,null));this.frame=0,this.pending=new Map,this.queue=[],this.nextId=1,this.ready=[],this.live=0,this.cacheLimit=e.cacheLimit||420,this.visible=[],this.onChunk=null,this.onDispose=null,this.workers=[],this.idle=[];let t=e.workers===void 0?2:e.workers;for(let n=0;n<t;n++){let s;try{s=new Worker(e.workerUrl)}catch{break}s.onmessage=r=>this._onMessage(s,r.data),s.onerror=()=>{this._workerFailed(s)},s.postMessage({type:"init",data:e.heightData}),this.workers.push(s)}this.sync=this.workers.length===0}_workerFailed(e){let t=this.workers.indexOf(e);t>=0&&this.workers.splice(t,1);let n=this.idle.indexOf(e);n>=0&&this.idle.splice(n,1),this.workers.length||(this.sync=!0);for(let[s,r]of this.pending)r._worker===e&&(this.pending.delete(s),r.state=0)}_onMessage(e,t){if(t.type==="ready"){this.idle.push(e);return}if(t.type==="chunk"){this.idle.push(e);let n=this.pending.get(t.id);this.pending.delete(t.id),n&&this.ready.push([n,t]),this._dispatch(!0)}}_rockKind(e){return e===this.rockLevels.big?"big":e===this.rockLevels.small?"small":null}_request(e,t){e.state===0&&(e.state=1,e.priority=t,this.queue.push(e))}_dispatch(e){if(this.queue.length){if(this.sync){if(e)return;this.queue.sort((t,n)=>t.priority-n.priority);for(let t=0;t<2&&this.queue.length;t++){let n=this.queue.shift();this.ready.push([n,Kf(this.planet,n.face,n.level,n.ix,n.iy,this.G,this._rockKind(n.level))])}return}if(this.idle.length){for(e||this.queue.sort((t,n)=>t.priority-n.priority);this.idle.length&&this.queue.length;){let t=this.queue.shift();if(t.used<this.frame-2){t.state=0;continue}let n=this.idle.pop(),s=this.nextId++;t._worker=n,this.pending.set(s,t),n.postMessage({type:"build",id:s,face:t.face,level:t.level,ix:t.ix,iy:t.iy,G:this.G,rocks:this._rockKind(t.level)})}if(this.queue.length>64)for(let t of this.queue.splice(64))t.state=0}}}_adopt(e,t){let n=new Ct;n.setAttribute("position",new nt(t.pos,3)),n.setAttribute("normal",new nt(t.nor,3,!0)),n.setAttribute("aTex",new nt(t.tex,3)),n.setIndex(this.index),n.boundingSphere=new _n(new C(0,0,0),t.radius);let s=new Et(n,this.material);s.position.set(t.origin[0],t.origin[1],t.origin[2]),s.matrixAutoUpdate=!1,s.updateMatrix(),s.receiveShadow=!0,s.castShadow=e.level>=this.shadowLevel,s.visible=!1,this.parent.add(s),e.mesh=s,e.state=2,e.center.set(t.origin[0],t.origin[1],t.origin[2]),e.radius=t.radius,e.maxR=t.maxR,this.live++,this.onChunk&&this.onChunk(e,t)}_drop(e){e.mesh&&(this.onDispose&&this.onDispose(e),this.parent.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh=null,this.live--),e.state=0}_localFloor(e,t,n){let s=11870;if((this.frame&7)!==1&&this._floor!==void 0)return this._floor;let r=this.planet.radius(t.x,t.y,t.z,12);if(n-r>250)return this._floor=s;let a=r,o=-t.z,l=t.x,c=Math.hypot(o,l)||1;o/=c,l/=c;let h=t.y*l,u=t.z*o-t.x*l,d=-t.y*o;for(let p of[120,320,650,1050,1500]){let g=p/12e3;for(let _=0;_<12;_++){let v=_/12*Math.PI*2+p,m=Math.cos(v)*g,y=Math.sin(v)*g,M=t.x+o*m+h*y,x=t.y+u*y,T=t.z+l*m+d*y,S=1/Math.hypot(M,x,T),b=this.planet.radius(M*S,x*S,T*S,24);b<a&&(a=b)}}return this._floor=Math.max(s,a-18)}_hidden(e,t,n,s){let r=Math.acos(Math.min(1,Math.max(-1,t.dot(e.dir)))),a=s+Math.acos(Math.min(1,this.floorR/e.maxR))+e.angle;return r>a}update(e){this.frame++;for(let r=0;r<12&&this.ready.length;r++){let[a,o]=this.ready.shift();a.state===1&&this._adopt(a,o)}let t=e.length(),n=ew.copy(e).multiplyScalar(1/t);this.floorR=this._localFloor(e,n,t);let s=Math.acos(Math.min(1,this.floorR/Math.max(t,this.floorR+1)));for(let r of this.visible)r.mesh.visible=!1;this.visible.length=0,this.missing=0;for(let r of this.roots)this._visit(r,e,n.clone(),t,s);for(let r of this.visible)r.mesh.visible=!0;return this._dispatch(),this.live>this.cacheLimit&&(this.frame&31)===0&&this._prune(),this.missing+this.ready.length}_visit(e,t,n,s,r){e.used=this.frame;let a=Math.max(0,t.distanceTo(e.center)-e.radius*.5),o=e.level<this.maxLevel&&a<e.size*this.split;if(e.level>1&&this._hidden(e,n,s,r))return!0;if(e.state===0&&this._request(e,a/e.size+e.level*.01),o){if(!e.children){let c=e.level+1,h=e.ix*2,u=e.iy*2;e.children=[new Kr(e.face,c,h,u,e),new Kr(e.face,c,h+1,u,e),new Kr(e.face,c,h,u+1,e),new Kr(e.face,c,h+1,u+1,e)]}let l=!0;for(let c of e.children)c.used=this.frame,!(c.level>1&&this._hidden(c,n,s,r))&&c.state!==2&&(l=!1,c.state===0&&this._request(c,t.distanceTo(c.center)/c.size+c.level*.01));if(l){for(let c of e.children)this._visit(c,t,n,s,r);return!0}this.missing++}return e.state===2?(this.visible.push(e),!0):(this.missing++,!1)}_prune(){let e=[],t=s=>{if(s.children)for(let r of s.children)t(r);s.level>0&&s.state===2&&s.used<this.frame-90&&e.push(s)};for(let s of this.roots)t(s);e.sort((s,r)=>s.used-r.used);for(let s=0;s<e.length&&this.live>this.cacheLimit*.8;s++)this._drop(e[s]);let n=s=>{if(!s.children)return s.state===0&&s.used<this.frame-90;let r=!0;for(let a of s.children)n(a)||(r=!1);return r&&(s.children=null),r&&s.state===0&&s.used<this.frame-90};for(let s of this.roots)n(s)}syncPads(e=[]){for(let r of this.workers)r.postMessage({type:"pads",pads:this.planet.pads});if(!e.length)return;let t=r=>e.some(a=>Math.acos(Math.min(1,Math.max(-1,r.dir.x*a.x+r.dir.y*a.y+r.dir.z*a.z)))<r.angle+(a.r+a.blend)/12e3),n=r=>{if(r.children)for(let a of r.children)n(a);r.state!==0&&t(r)&&(r._stale=!0)};for(let r of this.roots)n(r);let s=r=>{if(r.children)for(let a of r.children)s(a);r._stale&&r.state===2?(r._stale=!1,this._rebuild(r)):r._stale&&(r._stale=!1)};for(let r of this.roots)s(r)}_rebuild(e){let t=Kf(this.planet,e.face,e.level,e.ix,e.iy,this.G,this._rockKind(e.level)),n=e.mesh;this.onDispose&&this.onDispose(e),this.parent.remove(n),n.geometry.dispose(),this.live--,e.mesh=null,this._adopt(e,t),e.mesh.visible=n.visible}async settle(e,t=2e4){let n=performance.now();for(;;){if(this.update(e)===0&&!this.queue.length&&!this.pending.size)return!0;if(performance.now()-n>t)return!1;await new Promise(r=>setTimeout(r,12))}}stats(){let e={};for(let t of this.visible)e[t.level]=(e[t.level]||0)+1;return{visible:this.visible.length,live:this.live,terrainTris:this.visible.length*this.index.count/3,levels:e,queued:this.queue.length,pending:this.pending.size}}};var Qe=64;function iv(i){let e=i>>>0;return()=>{e=e+1831565813>>>0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function tw(i,e,t){let n=new Float32Array(Qe*Qe*Qe),s=iv(t),r=1,a=0;for(let o=0;o<e;o++){let l=i<<o,c=new Float32Array(l*l*l*3);for(let _=0;_<l*l*l;_++){let v=s()*2-1,m=s()*Math.PI*2,y=Math.sqrt(1-v*v);c[_*3]=y*Math.cos(m),c[_*3+1]=y*Math.sin(m),c[_*3+2]=v}let h=l/Qe,u=new Int32Array(Qe),d=new Int32Array(Qe),p=new Float32Array(Qe),g=new Float32Array(Qe);for(let _=0;_<Qe;_++){let v=_*h,m=Math.floor(v),y=v-m;u[_]=m%l,d[_]=(m+1)%l,p[_]=y,g[_]=y*y*y*(y*(y*6-15)+10)}for(let _=0,v=0;_<Qe;_++){let m=u[_]*l*l,y=d[_]*l*l,M=p[_],x=g[_];for(let T=0;T<Qe;T++){let S=u[T]*l,b=d[T]*l,w=p[T],L=g[T];for(let P=0;P<Qe;P++,v++){let F=u[P],O=d[P],z=p[P],D=g[P],G=(bt,Oe,et,ot)=>c[bt*3]*Oe+c[bt*3+1]*et+c[bt*3+2]*ot,X=G(m+S+F,z,w,M),H=G(m+S+O,z-1,w,M),ie=G(m+b+F,z,w-1,M),j=G(m+b+O,z-1,w-1,M),K=G(y+S+F,z,w,M-1),$=G(y+S+O,z-1,w,M-1),ae=G(y+b+F,z,w-1,M-1),he=G(y+b+O,z-1,w-1,M-1),Y=X+(H-X)*D,re=ie+(j-ie)*D,ve=K+($-K)*D,Ie=ae+(he-ae)*D,le=Y+(re-Y)*L,qe=ve+(Ie-ve)*L;n[v]+=(le+(qe-le)*x)*r}}}a+=r,r*=.55}for(let o=0;o<n.length;o++)n[o]=n[o]/a*1.6;return n}function nw(i,e){let t=new Float32Array(Qe*Qe*Qe),n=iv(e),s=i,r=Qe/s,a=new Float32Array(s*s*s*4);for(let o=0;o<s*s*s;o++){let l=Math.floor(o/(s*s)),c=Math.floor(o/s)%s,h=o%s;a[o*4]=(h+.2+n()*.6)*r,a[o*4+1]=(c+.2+n()*.6)*r,a[o*4+2]=(l+.2+n()*.6)*r;let u=n();a[o*4+3]=u<.58?0:r*(.14+.36*Math.pow(n(),2.6))}for(let o=0,l=0;o<Qe;o++)for(let c=0;c<Qe;c++)for(let h=0;h<Qe;h++,l++){let u=Math.floor(h/r),d=Math.floor(c/r),p=Math.floor(o/r),g=0;for(let _=-1;_<=1;_++)for(let v=-1;v<=1;v++)for(let m=-1;m<=1;m++){let y=(u+m+s)%s,M=(d+v+s)%s,T=(((p+_+s)%s*s+M)*s+y)*4,S=a[T+3];if(S===0)continue;let b=h-a[T],w=c-a[T+1],L=o-a[T+2];b-=Math.round(b/Qe)*Qe,w-=Math.round(w/Qe)*Qe,L-=Math.round(L/Qe)*Qe;let P=(b*b+w*w+L*L)/(S*S);if(P<1){let F=Math.sqrt(1-P)*(S/(r*.5));F>g&&(g=F)}}t[l]=g}return t}function nv(i,e,t,n){let s=new Uint8Array(Qe*Qe*Qe*4),r=(l,c,h)=>i[((h+Qe)%Qe*Qe+(c+Qe)%Qe)*Qe+(l+Qe)%Qe],a=l=>Math.max(0,Math.min(255,Math.round(l)));for(let l=0,c=0;l<Qe;l++)for(let h=0;h<Qe;h++)for(let u=0;u<Qe;u++,c++){let d=(r(u+1,h,l)-r(u-1,h,l))*.5,p=(r(u,h+1,l)-r(u,h-1,l))*.5,g=(r(u,h,l+1)-r(u,h,l-1))*.5;s[c*4]=a(127.5+d*e*127.5),s[c*4+1]=a(127.5+p*e*127.5),s[c*4+2]=a(127.5+g*e*127.5),s[c*4+3]=a((i[c]*t+n)*255)}let o=new Aa(s,Qe,Qe,Qe);return o.format=zn,o.type=wn,o.wrapS=o.wrapT=o.wrapR=Gi,o.minFilter=Sn,o.magFilter=Gt,o.generateMipmaps=!0,o.unpackAlignment=1,o.needsUpdate=!0,o}var Yf=null;function lu(){return Yf||(Yf={grain:nv(tw(4,4,7),2.6,.5,.5),pebbles:nv(nw(8,23),1.4,1,0)}),Yf}var iw=i=>i.toFixed(6),Jf=`
  vec3 groundGrade(vec3 alb) {
    float lum = dot(alb, vec3(0.3, 0.55, 0.15));
    return mix(vec3(lum), alb, 0.70) * vec3(1.44, 1.19, 0.90);
  }`,sw=`mat3(${Yt.map(iw).join(", ")})`;function sv(i,e={}){let t=lu(),n=new Yn({color:16777215,roughness:.94,metalness:0});return n.userData.uniforms={uAlbedo:{value:i},uGrain:{value:t.grain},uPebbles:{value:t.pebbles},uDust:{value:0}},n.defines=n.defines||{},e.fine!==!1&&(n.defines.TERRAIN_FINE=""),n.onBeforeCompile=s=>{Object.assign(s.uniforms,n.userData.uniforms),s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
        attribute vec3 aTex;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        vTex = aTex;
        vPlanetPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vGeoNormal = normalize(normal);`),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
        uniform samplerCube uAlbedo;
        uniform highp sampler3D uGrain;
        uniform highp sampler3D uPebbles;
        uniform float uDust;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;
        const mat3 DETAIL_T = ${sw};
        ${Jf}`).replace("#include <map_fragment>",`
        vec3 pDir = normalize(vPlanetPos);
        vec3 geoN = normalize(vGeoNormal);
        float viewDist = length(vViewPosition);
        float slope = 1.0 - clamp(dot(geoN, pDir), 0.0, 1.0);

        // ---- real colour of this spot, graded from orbital imagery toward surface colour ----
        vec3 alb = textureCube(uAlbedo, pDir).rgb;
        float albLum = dot(alb, vec3(0.3, 0.55, 0.15));
        // polar ice: in the orbital map it is the only ground that is both bright and nearly colourless
        float ice = smoothstep(0.19, 0.30, albLum) * smoothstep(0.50, 0.78, min(alb.g, alb.b) / max(alb.r, 0.001)) * smoothstep(0.88, 0.95, abs(pDir.y));
        alb = groundGrade(alb);

        // ---- detail layers (height in .a, world-frame gradient after DETAIL_T in .rgb) ----
        vec4 nFar = texture(uGrain, (vPlanetPos * DETAIL_T) / 256.0);
        vec4 nMid = texture(uGrain, vTex / 32.0);
        vec4 nLump = texture(uGrain, vTex / 4.0);
        float fFar = smoothstep(40.0, 320.0, viewDist) * (1.0 - smoothstep(3000.0, 9000.0, viewDist));
        float fMid = 1.0 - smoothstep(160.0, 900.0, viewDist);
        float fLump = 1.0 - smoothstep(24.0, 110.0, viewDist);
        float hFar = nFar.a - 0.5, hMid = nMid.a - 0.5, hLump = nLump.a - 0.5;
        vec3 grad = (nFar.rgb - 0.5) * (0.40 * fFar) + (nMid.rgb - 0.5) * (0.36 * fMid) + (nLump.rgb - 0.5) * (0.80 * fLump);
        float tone = hFar * 0.22 + hMid * 0.42 * fMid + hLump * 0.75 * fLump;
        float stones = 0.0, stoneTop = 0.0;
        #ifdef TERRAIN_FINE
          float fGrain = 1.0 - smoothstep(4.0, 20.0, viewDist);
          float fPeb = 1.0 - smoothstep(7.0, 26.0, viewDist);
          if (fPeb > 0.0) {
            vec4 nGrain = texture(uGrain, vTex * 2.0);
            vec4 peb = texture(uPebbles, vTex * 2.0);
            // grit lies in patches: where the undulation layers say the fines have blown away
            float patchy = smoothstep(-0.02, 0.16, hMid * 0.9 - hFar * 0.6 + hLump * 0.6 + slope * 0.6);
            stones = smoothstep(0.10, 0.34, peb.a) * fPeb * patchy;
            stoneTop = peb.a;
            grad += (nGrain.rgb - 0.5) * (0.95 * fGrain * (1.0 - stones)) + (peb.rgb - 0.5) * (0.9 * stones);
            // the sand itself: a fine speckle of darker and paler grains
            float speck = nGrain.a - 0.5;
            tone += (speck * 0.75 + smoothstep(0.10, 0.22, speck) * 0.10 - smoothstep(0.10, 0.22, -speck) * 0.12) * fGrain;
          }
        #endif

        // ---- what the ground is made of here ----
        vec3 col = alb * (1.0 + tone * 0.42);
        // darker, coarser sand in the hollows
        float coarse = smoothstep(0.02, 0.22, -hMid * fMid - hFar * 0.6);
        col = mix(col, col * vec3(0.72, 0.69, 0.71), coarse * 0.45);
        // bedrock where it is too steep for dust to lie, in bands that follow the layering
        float rock = smoothstep(0.15, 0.34, slope + hMid * 0.10 * fMid + hFar * 0.06);
        float bandAt = length(vPlanetPos) * 0.11 + hFar * 0.9 + hMid * 0.25;
        vec4 band = texture(uGrain, vec3(bandAt, 0.37, 0.71));
        vec3 rockCol = alb * mix(vec3(0.58, 0.53, 0.54), vec3(0.96, 0.88, 0.82), smoothstep(0.30, 0.70, band.a));
        col = mix(col, rockCol, rock * 0.85);
        grad += pDir * ((band.r - 0.5) * 2.4 * rock) * (1.0 - smoothstep(300.0, 1500.0, viewDist));
        // stones: dark basalt, dusted on top
        vec3 stoneCol = alb * vec3(0.60, 0.56, 0.57) * (1.0 + stoneTop * 0.10);
        col = mix(col, stoneCol, stones);
        // polar ice
        col = mix(col, vec3(0.78, 0.84, 0.92) * (1.0 + tone * 0.22), ice);
        // a storm lays pale dust over everything
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        diffuseColor.rgb = col;
        float terrainRough = mix(0.96, 0.86, max(rock, stones)) - ice * 0.42;
        vec3 terrainGrad = grad * (1.0 - ice * 0.55);`).replace("#include <roughnessmap_fragment>","float roughnessFactor = clamp(terrainRough, 0.05, 1.0);").replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
        {
          vec3 wn = geoN;
          vec3 gW = DETAIL_T * terrainGrad;                  // texture frame -> world
          gW -= wn * dot(gW, wn);                            // only the part along the surface tilts it
          wn = normalize(wn - gW);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`)},n.customProgramCacheKey=()=>"terrain2"+(e.fine!==!1?"F":""),n}function Bt(i,e,t=new C){let n=i*Rs,s=e*Rs;return t.set(Math.cos(n)*Math.cos(s),Math.sin(n),-Math.cos(n)*Math.sin(s))}function Qn(i){let e=Math.hypot(i.x,i.y,i.z)||1;return{lat:Math.asin(_e(i.y/e,-1,1))/Rs,lon:(Math.atan2(-i.z,i.x)/Rs+360)%360}}function En(i,e,t,n,s,r){let a=i-n,o=e-s,l=t-r;return 2*Math.asin(_e(Math.sqrt(a*a+o*o+l*l)/2,0,1))}var cu=new C,hu=new C;function st(i,e){return cu.copy(i).normalize(),hu.copy(e).normalize(),En(cu.x,cu.y,cu.z,hu.x,hu.y,hu.z)*12e3}function gi(i,e,t){e.set(-i.z,0,i.x),e.lengthSq()<1e-10&&e.set(1,0,0),e.normalize(),t.crossVectors(i,e)}var rv=new C,av=new C,$f=new C,ov=new C,lv=new ke;function $i(i,e,t=new dt){return gi(i,rv,av),$f.copy(av).multiplyScalar(Math.cos(e)).addScaledVector(rv,Math.sin(e)),ov.crossVectors(i,$f),lv.makeBasis(ov,i,$f),t.setFromRotationMatrix(lv)}function vi(i){return i>999?(i/1e3).toFixed(1)+" km":Math.round(i)+" m"}var ce={engine:null,planet:null,terrain:null,world:null,mapImage:null};var bi=new C,Zi=new C,u2=new C,An=new C,Gn=new C,Vn=new C,Pe=new C,We=new C,Ce=new C,uu=new C,xi=new dt,Ps=new dt,gl=new C(0,1,0),vl=new C(1,0,0);function St(i){let e=1/Math.hypot(i.x,i.y,i.z);return ce.planet.radius(i.x*e,i.y*e,i.z*e)}function cv(i,e,t){return ce.planet.elevationMetres(i,e,t)/1e3}function hv(i,e=40){gi(i,Gn,Vn);let t=St(i),n=0;for(let[s,r]of[[1,0],[-1,0],[0,1],[0,-1]])An.copy(i).addScaledVector(Gn,s*e/12e3).addScaledVector(Vn,r*e/12e3).normalize(),n=Math.max(n,Math.abs(St(An)-t)/e);return n}function pu(i,e,t){let n=1/Math.hypot(i.x,i.y,i.z),s=i.x*n,r=i.y*n,a=i.z*n;An.set(s,r,a),gi(An,Gn,Vn);let o=e/12e3,l=ce.planet.radius(...fu(s+Gn.x*o,r+Gn.y*o,a+Gn.z*o))-ce.planet.radius(...fu(s-Gn.x*o,r-Gn.y*o,a-Gn.z*o)),c=ce.planet.radius(...fu(s+Vn.x*o,r+Vn.y*o,a+Vn.z*o))-ce.planet.radius(...fu(s-Vn.x*o,r-Vn.y*o,a-Vn.z*o)),h=l/(2*e),u=c/(2*e),d=Math.hypot(h,u);return t&&(d>1e-6?t.copy(Gn).multiplyScalar(-h/d).addScaledVector(Vn,-u/d):t.set(0,0,0)),d}var du=[0,0,0];function fu(i,e,t){let n=1/Math.hypot(i,e,t);return du[0]=i*n,du[1]=e*n,du[2]=t*n,du}var ei={story:{name:"BOTANIST",rescueSol:20,drain:.75,desc:`Rescue: Sol 20. Forgiving drains,
storms always forecast. See Mars, grow spuds.`},survival:{name:"ENGINEER",rescueSol:45,drain:1,desc:`Rescue: Sol 45. The intended experience.
Provision your expeditions or die packing.`},iron:{name:"SPACE PIRATE",rescueSol:60,drain:1.15,desc:`Rescue: Sol 60. Death rewinds nothing \u2014
one life, whole planet, no complaints.`}},f={started:!1,uiOpen:!1,over:!1,won:!1,sleeping:!1,firstPerson:!1,mode:"walk",diff:"survival",rescueSol:45,drainMult:1,sol:1,tod:.02,o2:100,water:42,food:10,potatoes:0,power:72,health:100,suit:46,roverPower:100,roverO2:300,hydrazine:3,inv:{scrap:0,circuit:0,regolith:0,ice:0,candle:0,kitSolar:0,kitGreenhouse:0,kitBeacon:0,kitCache:0},upgrades:{},blueprints:{drill:!1,drive2:!1,tank2:!1,recycler:!1},inside:!1,storm:{i:0,cells:[]},breach:{active:!1,done:!1,cropsKilled:!1,timer:0},pf:{found:!1,loaded:!1,connected:!1},disco:!1,discovered:{},salvaged:{},achieved:{},quests:{},checkedSystems:{},flags:{coldOpen:!0,suitSealed:!1,didMath:!1,hydrazineBoom:!1,pfRevealed:!1,mavRevealed:!1,mavStripped:!1,nasaMsg:0,routePods:!1},stats:{potatoes:0,panels:0,walked:0,driven:0,closeCalls:0,booms:0,mined:0,crafted:0,discoveries:0,discoTime:0,stormOut:0},holdT:0,shake:0,dead:null},Le={solLen:220,o2Drain:22,o2Gen:42,o2BreachDrain:210,waterMax:120,waterDrain:6,waterRecl:4.5,waterPerDose:5,hydrazineWater:28,iceWater:10,powerMax:100,powerBase:34,solarGen:118,dustRate:.05,stormDustRate:.7,stormGenMult:.14,potatoYield:4,growSols:2.4,waterings:2,healthMax:100,starveDrain:16,suffocateDrain:10,healRegen:4,sleepHeal:10,walkSpeed:5.1,runSpeed:9.2,jumpV:3.4,gravity:3.72,suitCap:100,roverO2Cap:300,roverPowerCap:100,roverDrainPerMin:5,roverChargeAtHab:25};function en(){return f.upgrades.tank2?200:f.upgrades.tank1?150:Le.suitCap}function Zf(){return f.upgrades.drive2?55:f.upgrades.drive1?45:35}function cr(){return f.upgrades.roverBattery?160:Le.roverPowerCap}var Is=document.createElement("div");Is.id="mg-root";document.body.appendChild(Is);function vt(i,e,t,n,s){let r=document.createElement(i);return e&&(r.id=e),t&&(r.className=t),s!==void 0&&(r.innerHTML=s),(n||Is).appendChild(r),r}var Q={};Q.vitals=vt("div","mg-vitals","mg-hud");var rw=[["suit","SUIT O2","#7fd4ff"],["o2","HAB O2","#9fd49f"],["water","H2O","#6fb7ff"],["food","FOOD","#d8c26f"],["power","PWR","#7fca7f"],["health","VITALS","#ff8f7f"]];Q.bars={};for(let[i,e,t]of rw){let n=vt("div",null,"mg-bar",Q.vitals);n.innerHTML=`<div class="lb"><span>${e}</span><span class="val"></span></div>
    <div class="tk"><div class="fl" style="background:${t}"></div></div>`,Q.bars[i]={wrap:n,fill:n.querySelector(".fl"),val:n.querySelector(".val")}}Q.clock=vt("div","mg-clock","mg-hud");Q.compass=vt("div","mg-compass","mg-hud");Q.region=vt("div","mg-region","mg-hud");Q.objectives=vt("div","mg-objectives","mg-hud");Q.keys=vt("div","mg-keys","mg-hud",null,'<span class="mg-kbd">M</span> MAP \xB7 <span class="mg-kbd">C</span> COLONY \xB7 <span class="mg-kbd">J</span> JOURNAL');Q.log=vt("div","mg-log","mg-hud");Q.prompt=vt("div","mg-prompt","mg-hud");Q.promptText=vt("div",null,null,Q.prompt);Q.promptSub=vt("div",null,"sub",Q.prompt);Q.hold=vt("div","mg-hold",null,Q.prompt,'<div class="fl"></div>');Q.holdFill=Q.hold.querySelector(".fl");Q.crosshair=vt("div","mg-crosshair","mg-hud",null,"+");Q.vign=vt("div","mg-vign","mg-hud");Q.cold=vt("div","mg-cold","mg-hud");Q.flash=vt("div","mg-flash","mg-hud");Q.toast=vt("div","mg-toast","mg-hud");Q.overlay=vt("div","mg-overlay",null);Q.panel=vt("div","mg-panel",null,Q.overlay);Q.touch=vt("div","mg-touch",null,Is);Q.joy=vt("div","mg-joy",null,Q.touch);Q.joyKnob=vt("div","mg-joyknob",null,Q.joy);Q.tE=vt("div","mg-tE","mg-tbtn",Q.touch,"HOLD");Q.tJump=vt("div","mg-tJump","mg-tbtn",Q.touch,"JUMP");Q.tSprint=vt("div","mg-tSprint","mg-tbtn",Q.touch,"RUN");Q.tExit=vt("div","mg-tExit","mg-tbtn",Q.touch,"EXIT");Q.tRow=vt("div","mg-trow",null,Q.touch,'<div class="mg-tbtn" data-t="map">MAP</div><div class="mg-tbtn" data-t="colony">CRAFT</div><div class="mg-tbtn" data-t="journal">LOG</div><div class="mg-tbtn" data-t="cam">CAM</div>');Q.mapScreen=vt("div","mg-map","mg-screen",Is,'<h1>MARS \xB7 ORBITAL SURVEY</h1><div class="close">\u2715 CLOSE</div><div id="mg-map-wrap"><canvas id="mg-mapcanvas"></canvas><div id="mg-maplegend"></div></div>');Q.colonyScreen=vt("div","mg-colony2","mg-screen",Is,'<h1>COLONY \xB7 INVENTORY & FABRICATION</h1><div class="close">\u2715 CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-inv"></div><div class="mg-col" id="mg-craft"></div><div class="mg-col" id="mg-build"></div></div>');Q.journalScreen=vt("div","mg-journal","mg-screen",Is,'<h1>MISSION JOURNAL</h1><div class="close">\u2715 CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-quests"></div><div class="mg-col" id="mg-discoveries"></div><div class="mg-col" id="mg-achievements"></div></div>');Q.mapCanvas=Q.mapScreen.querySelector("#mg-mapcanvas");function yi(i){let e=(i.buttons||[]).map((t,n)=>`<button data-i="${n}" class="${t.ghost?"ghost":""}">${t.label}</button>`).join("");Q.panel.innerHTML=(i.title?`<h1>${i.title}</h1>`:"")+(i.subtitle?`<h2>${i.subtitle}</h2>`:"")+`<div class="bd">${i.body||""}</div>`+(e?`<div class="btns">${e}</div>`:""),Q.overlay.style.display="flex",f.uiOpen=!0;try{document.exitPointerLock&&document.exitPointerLock()}catch{}Q.panel.querySelectorAll("button").forEach(t=>{t.onclick=n=>{n.stopPropagation();let s=i.buttons[+t.dataset.i];s.keep!==!0&&Yr(),s.fn&&s.fn()}})}function Yr(){Q.overlay.style.display="none",f.uiOpen=!1}var uv=null;function bl(i,e,t){Q.toast.innerHTML=`<div class="t1">${i}</div><div class="t2">${e}</div>`+(t?`<div class="t3">${t}</div>`:""),Q.toast.style.display="block",clearTimeout(uv),uv=setTimeout(()=>{Q.toast.style.display="none"},6e3)}function Ue(i,e){let t=vt("div",null,"mg-line"+(e?" "+e:""),Q.log),n=0,r=(e==="nasa"?"[NASA] ":e==="sys"?"[HAB] ":e==="disc"?"[SURVEY] ":"[LOG] ")+i,a=setInterval(()=>{n+=2,t.textContent=r.slice(0,n),n>=r.length&&(clearInterval(a),setTimeout(()=>{t.classList.add("fade"),setTimeout(()=>t.remove(),1400)},9500))},16);for(;Q.log.children.length>5;)Q.log.firstChild.remove()}function xl(i,e){Q.flash.style.background=i,Q.flash.style.opacity=1,setTimeout(()=>{Q.flash.style.transition="opacity .6s",Q.flash.style.opacity=0,setTimeout(()=>{Q.flash.style.transition=""},700)},e)}var we={ctx:null,master:null,windGain:null,rumbleGain:null,discoTimer:null,alarmTimer:null,_lastWind:-1,_lastRumble:-1,init(){if(!this.ctx)try{let i=window.AudioContext||window.webkitAudioContext;if(!i)return;this.ctx=new i,this.master=this.ctx.createGain(),this.master.gain.value=.5,this.master.connect(this.ctx.destination);let e=this.ctx.sampleRate*2,t=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=t.getChannelData(0);for(let r=0;r<e;r++)n[r]=Math.random()*2-1;this.noiseBuf=t;let s=(r,a)=>{let o=this.ctx.createBufferSource();o.buffer=t,o.loop=!0;let l=this.ctx.createBiquadFilter();l.type=a,l.frequency.value=r,l.Q.value=.6;let c=this.ctx.createGain();return c.gain.value=0,o.connect(l),l.connect(c),c.connect(this.master),o.start(),c};this.windGain=s(260,"bandpass"),this.rumbleGain=s(110,"lowpass")}catch{this.ctx=null}},resume(){try{this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}catch{}},_ramp(i,e,t,n){if(!(!i||Math.abs(t-this[e])<.01)){this[e]=t;try{i.gain.cancelScheduledValues(this.ctx.currentTime),i.gain.linearRampToValueAtTime(t,this.ctx.currentTime+n)}catch{}}},wind(i){this._ramp(this.windGain,"_lastWind",_e(i,0,1)*.5,.6)},rumble(i){this._ramp(this.rumbleGain,"_lastRumble",_e(i,0,1),.3)},beep(i,e,t,n){if(this.ctx)try{let s=this.ctx.createOscillator(),r=this.ctx.createGain();s.type=t||"sine",s.frequency.value=i,r.gain.setValueAtTime(n||.18,this.ctx.currentTime),r.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+(e||.15)),s.connect(r),r.connect(this.master),s.start(),s.stop(this.ctx.currentTime+(e||.15)+.02)}catch{}},click(){this.beep(900,.05,"square",.06)},ok(){this.beep(620,.09,"sine",.14),setTimeout(()=>this.beep(930,.14,"sine",.14),90)},pickup(){this.beep(500,.06,"triangle",.14),setTimeout(()=>this.beep(750,.08,"triangle",.12),70)},craft(){[392,494,587].forEach((i,e)=>setTimeout(()=>this.beep(i,.12,"triangle",.13),e*90))},jingle(){[523,659,784,1047].forEach((i,e)=>setTimeout(()=>this.beep(i,.22,"triangle",.16),e*130))},discovery(){[659,880,1109,1319].forEach((i,e)=>setTimeout(()=>this.beep(i,.3,"sine",.13),e*160))},bad(){this.beep(220,.3,"sawtooth",.16)},boom(){if(this.ctx)try{let i=this.ctx.createBufferSource();i.buffer=this.noiseBuf;let e=this.ctx.createBiquadFilter();e.type="lowpass",e.frequency.setValueAtTime(900,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(60,this.ctx.currentTime+1.1);let t=this.ctx.createGain();t.gain.setValueAtTime(.9,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+1.3),i.connect(e),e.connect(t),t.connect(this.master),i.start(),i.stop(this.ctx.currentTime+1.4)}catch{}},alarm(i){if(i&&!this.alarmTimer){let e=()=>{this.beep(740,.18,"square",.1),setTimeout(()=>this.beep(520,.18,"square",.1),250)};e(),this.alarmTimer=setInterval(e,900)}else!i&&this.alarmTimer&&(clearInterval(this.alarmTimer),this.alarmTimer=null)},disco(i){if(i&&!this.discoTimer){let e=[110,110,147,110,165,147,110,98],t=[440,0,523,440,0,587,523,0],n=0;this.discoTimer=setInterval(()=>{this.beep(e[n%8],.16,"sawtooth",.09),t[n%8]&&this.beep(t[n%8],.1,"square",.045),n%2===0&&this.beep(60,.08,"sine",.22),n++},210)}else!i&&this.discoTimer&&(clearInterval(this.discoTimer),this.discoTimer=null)}};function Qf(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new Ct;l.morphTargetsRelative=o;let c=0;for(let h=0;h<i.length;++h){let u=i[h],d=0,p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let g in u.attributes){if(!n.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+g+'" attribute exists among all geometries, or in none of them.'),null;r[g]===void 0&&(r[g]=[]),r[g].push(u.attributes[g]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let g in u.morphAttributes){if(!s.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;if(u.morphAttributes[g].length!==i[0].morphAttributes[g].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have the same number of morph targets for the "'+g+'" morph attribute.'),null;a[g]===void 0&&(a[g]=[]),a[g].push(u.morphAttributes[g]),p++}if(p!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of morph attributes."),null;if(e){let g;if(t)g=u.index.count;else if(u.attributes.position!==void 0)g=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,g,h),c+=g}}if(t){let h=0,u=[];for(let d=0;d<i.length;++d){let p=i[d].index;for(let g=0;g<p.count;++g)u.push(p.getX(g)+h);h+=i[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=dv(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let p=[];for(let _=0;_<a[h].length;++_)p.push(a[h][_][d]);let g=dv(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}}return l}function dv(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let h=i[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let a=new e(r),o=new nt(a,t,n),l=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let d=0,p=h.count;d<p;d++)for(let g=0;g<t;g++){let _=h.getComponent(d,g);o.setComponent(d+u,g,_)}}else a.set(h.array,l);l+=h.count*t}return s!==void 0&&(o.gpuType=s),o}function pv(i,e=1e-4){e=Math.max(e,Number.EPSILON);let t={},n=i.getIndex(),s=i.getAttribute("position"),r=n?n.count:s.count,a=0,o=Object.keys(i.attributes),l=[],c=new Map,h=[],u=["getX","getY","getZ","getW"],d=e*.5,p=Math.log10(1/e),g=Math.pow(10,p),_=d*g;for(let m=0;m<r;m++){let y=n?n.getX(m):m,M="";for(let x=0,T=o.length;x<T;x++){let S=o[x],b=i.getAttribute(S),w=b.itemSize;for(let L=0;L<w;L++)M+=`${Math.trunc(b[u[L]](y)*g+_)},`}M in t?h.push(t[M]):(l.push(y),t[M]=a,h.push(a),a++)}let v=i.clone();for(let m in i.attributes)v.setAttribute(m,fv(i.attributes[m],l,c));for(let m in i.morphAttributes)v.morphAttributes[m]=i.morphAttributes[m].map(y=>fv(y,l,c));return v.setIndex(h),v}function ep(i,e){if(e===ef)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Wa||e===ol){let t=i.getIndex();if(t===null){let r=[],a=i.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Wa)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function mv(i,e=Math.PI/3){let t=i.index?i.toNonIndexed():i,n=t.attributes.position,s=n.count,r;if(n.isBufferAttribute===!0&&n.itemSize===3&&n.normalized===!1)r=n.array;else{r=new Float64Array(s*3);for(let x=0;x<s;x++)r[3*x+0]=n.getX(x),r[3*x+1]=n.getY(x),r[3*x+2]=n.getZ(x)}let a=Math.cos(e),o=(1+1e-10)*100,l=s/3,c=new Float64Array(l*3);for(let x=0;x<l;x++){let T=9*x,S=r[T+0],b=r[T+1],w=r[T+2],L=r[T+3],P=r[T+4],F=r[T+5],O=r[T+6],z=r[T+7],D=r[T+8],G=O-L,X=z-P,H=D-F,ie=S-L,j=b-P,K=w-F,$=X*K-H*j,ae=H*ie-G*K,he=G*j-X*ie,Y=1/(Math.sqrt($*$+ae*ae+he*he)||1);c[3*x+0]=$*Y,c[3*x+1]=ae*Y,c[3*x+2]=he*Y}let h=new Int32Array(s),u=new Float64Array(s*3),d=1;for(;d<s*2;)d<<=1;let p=d-1,g=new Int32Array(d),_=0;for(let x=0;x<s;x++){let T=3*x,S=Math.trunc(r[T+0]*o),b=Math.trunc(r[T+1]*o),w=Math.trunc(r[T+2]*o),L=(Math.imul(S,73856093)^Math.imul(b,19349663)^Math.imul(w,83492791))&p;for(;;){let P=g[L];if(P===0){let O=3*_;u[O+0]=S,u[O+1]=b,u[O+2]=w,g[L]=_+1,h[x]=_++;break}let F=3*(P-1);if(u[F+0]===S&&u[F+1]===b&&u[F+2]===w){h[x]=P-1;break}L=L+1&p}}let v=new Int32Array(_+1);for(let x=0;x<s;x++)v[h[x]+1]++;for(let x=0;x<_;x++)v[x+1]+=v[x];let m=new Int32Array(s),y=v.slice(0,_);for(let x=0;x<l;x++){let T=3*x;m[y[h[T+0]]++]=x,m[y[h[T+1]]++]=x,m[y[h[T+2]]++]=x}let M=new Float32Array(s*3);for(let x=0;x<l;x++){let T=3*x,S=c[T+0],b=c[T+1],w=c[T+2];for(let L=0;L<3;L++){let P=T+L,F=h[P],O=0,z=0,D=0;for(let X=v[F],H=v[F+1];X<H;X++){let ie=3*m[X],j=c[ie+0],K=c[ie+1],$=c[ie+2];S*j+b*K+w*$>a&&(O+=j,z+=K,D+=$)}let G=1/(Math.sqrt(O*O+z*z+D*D)||1);M[3*P+0]=O*G,M[3*P+1]=z*G,M[3*P+2]=D*G}}return t.setAttribute("normal",new nt(M,3,!1)),t}function fv(i,e,t=new Map){let n=i.isInterleavedBufferAttribute,s=n?i.data:i,r=n?s.stride:i.itemSize,a=n?t.get(s):void 0;if(a===void 0){let l=new s.array.constructor(e.length*r);for(let c=0;c<e.length;c++)for(let h=0;h<r;h++)l[c*r+h]=s.array[e[c]*r+h];a=n?new s.constructor(l,r,s.meshPerAttribute):new i.constructor(l,i.itemSize,i.normalized,i.meshPerAttribute),a.setUsage(s.usage),n&&t.set(s,a)}let o=n?new i.constructor(a,i.itemSize,i.offset,i.normalized):a;return o.name=i.name,n||(o.gpuType=i.gpuType),o}function mu(i){let e=new Map,t=new Map,n=i.clone();return gv(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function gv(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)gv(i.children[n],e.children[n],t)}var gu=class extends qi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new op(t)}),this.register(function(t){return new lp(t)}),this.register(function(t){return new cp(t)}),this.register(function(t){return new bp(t)}),this.register(function(t){return new xp(t)}),this.register(function(t){return new yp(t)}),this.register(function(t){return new up(t)}),this.register(function(t){return new dp(t)}),this.register(function(t){return new fp(t)}),this.register(function(t){return new pp(t)}),this.register(function(t){return new ap(t)}),this.register(function(t){return new mp(t)}),this.register(function(t){return new hp(t)}),this.register(function(t){return new vp(t)}),this.register(function(t){return new gp(t)}),this.register(function(t){return new sp(t)}),this.register(function(t){return new vu(t,ht.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new vu(t,ht.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new _p(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=Ss.extractUrlBase(e);a=Ss.resolveURL(c,this.path)}else a=Ss.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new ka(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===_v){try{a[ht.KHR_BINARY_GLTF]=new Mp(e)}catch(u){s&&s(u);return}r=JSON.parse(a[ht.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Cp(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case ht.KHR_MATERIALS_UNLIT:a[u]=new rp;break;case ht.KHR_DRACO_MESH_COMPRESSION:a[u]=new Sp(r,this.dracoLoader);break;case ht.KHR_TEXTURE_TRANSFORM:a[u]=new wp;break;case ht.KHR_MESH_QUANTIZATION:a[u]=new Tp;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function aw(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Vt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var ht={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},sp=class{constructor(e){this.parser=e,this.name=ht.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new Ee(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Dn);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Ko(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new zr(h),c.distance=u;break;case"spot":c=new Ms(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Qi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},rp=class{constructor(){this.name=ht.KHR_MATERIALS_UNLIT}getMaterialType(){return pn}extendParams(e,t,n){let s=[];e.color=new Ee(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Dn),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Ht))}return Promise.all(s)}},ap=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},op=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new He(r,r)}return Promise.all(s)}},lp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(s)}},cp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},hp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},up=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_SHEEN}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new Ee(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Dn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Ht)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},dp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},fp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_VOLUME}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Ee().setRGB(r[0],r[1],r[2],Dn),Promise.all(s)}},pp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_IOR}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},mp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new Ee().setRGB(r[0],r[1],r[2],Dn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Ht)),Promise.all(s)}},gp=class{constructor(e){this.parser=e,this.name=ht.EXT_MATERIALS_BUMP}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},vp=class{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Vt(this.parser,e,this.name)!==null?Fn:null}extendMaterialParams(e,t){let n=Vt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},bp=class{constructor(e){this.parser=e,this.name=ht.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},xp=class{constructor(e){this.parser=e,this.name=ht.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},yp=class{constructor(e){this.parser=e,this.name=ht.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},vu=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(p){return p.buffer}):a.ready.then(function(){let p=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(p),h,u,d,s.mode,s.filter),p})})}else return null}},_p=class{constructor(e){this.name=ht.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==_i.TRIANGLES&&c.mode!==_i.TRIANGLE_STRIP&&c.mode!==_i.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,p=[];for(let g of u){let _=new ke,v=new C,m=new dt,y=new C(1,1,1),M=new ms(g.geometry,g.material,d);for(let T=0;T<d;T++)l.TRANSLATION&&v.fromBufferAttribute(l.TRANSLATION,T),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,T),l.SCALE&&y.fromBufferAttribute(l.SCALE,T),M.setMatrixAt(T,_.compose(v,m,y));let x=null;for(let T in l)if(T==="_COLOR_0"){let S=l[T];M.instanceColor=new ci(S.array,S.itemSize,S.normalized)}else if(T!=="TRANSLATION"&&T!=="ROTATION"&&T!=="SCALE"){if(x===null){let b=M.geometry;x=new Ct,x.name=b.name;for(let w in b.attributes)x.setAttribute(w,b.attributes[w]);for(let w in b.morphAttributes)x.morphAttributes[w]=b.morphAttributes[w];b.index!==null&&x.setIndex(b.index),x.morphTargetsRelative=b.morphTargetsRelative;for(let w of b.groups)x.addGroup(w.start,w.count,w.materialIndex);b.boundingBox!==null&&(x.boundingBox=b.boundingBox.clone()),b.boundingSphere!==null&&(x.boundingSphere=b.boundingSphere.clone()),x.drawRange.start=b.drawRange.start,x.drawRange.count=b.drawRange.count,x.userData=Object.assign({},b.userData),M.geometry=x}let S=l[T];x.setAttribute(T,new ci(S.array,S.itemSize,S.normalized))}Tt.prototype.copy.call(M,g),this.parser.assignFinalMaterial(M),p.push(M)}return h.isGroup?(h.clear(),h.add(...p),h):p[0]}))}},_v="glTF",yl=12,vv={JSON:1313821514,BIN:5130562},Mp=class{constructor(e){this.name=ht.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,yl),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==_v)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-yl,r=new DataView(e,yl),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===vv.JSON){let c=new Uint8Array(e,yl+a,o);this.content=n.decode(c)}else if(l===vv.BIN){let c=yl+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Sp=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ht.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let h in a){let u=Ap[h]||h.toLowerCase();o[u]=a[h]}for(let h in e.attributes){let u=Ap[h]||h.toLowerCase();if(a[h]!==void 0){let d=n.accessors[e.attributes[h]],p=ro[d.componentType];c[u]=p.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(p){for(let g in p.attributes){let _=p.attributes[g],v=l[g];v!==void 0&&(_.normalized=v)}u(p)},o,c,Dn,d)})})}},wp=class{constructor(){this.name=ht.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},Tp=class{constructor(){this.name=ht.KHR_MESH_QUANTIZATION}},bu=class extends Wi{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=s-t,u=(n-t)/h,d=u*u,p=d*u,g=e*c,_=g-c,v=-2*p+3*d,m=p-d,y=1-v,M=m-d+u;for(let x=0;x!==o;x++){let T=a[_+x+o],S=a[_+x+l]*h,b=a[g+x+o],w=a[g+x]*h;r[x]=y*T+M*S+v*b+m*w}return r}},ow=new dt,Ep=class extends bu{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return ow.fromArray(r).normalize().toArray(r),r}},_i={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ro={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},bv={9728:jt,9729:Gt,9984:Kc,9985:Ga,9986:Vr,9987:Sn},xv={33071:oi,33648:Sa,10497:Gi},tp={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ap={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},hr={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},lw={CUBICSPLINE:void 0,LINEAR:Ir,STEP:Pr},np={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function cw(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Yn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Xi})),i.DefaultMaterial}function Jr(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Qi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function hw(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;a.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;o.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function uw(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function dw(i){let e,t=i.extensions&&i.extensions[ht.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ip(t.attributes):e=i.indices+":"+ip(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+ip(i.targets[n]);return e}function ip(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Rp(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function fw(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var pw=new ke,Cp=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new aw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?(this.textureLoader=new qo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new Jo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ka(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return Jr(r,o,s),Qi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,h]of a.children.entries())r(h,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ht.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(Ss.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=tp[s.type],o=ro[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new nt(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=tp[s.type],c=ro[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=s.byteOffset||0,p=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,_,v;if(p&&p!==u){let m=Math.floor(d/p),y="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count,M=t.cache.get(y);M||(_=new c(o,m*p,s.count*p/h),M=new Pa(_,p/h),t.cache.add(y,M)),v=new Ia(M,l,d%p/h,g)}else o===null?_=new c(s.count*l):_=new c(o,d,s.count*l),v=new nt(_,l,g);if(s.sparse!==void 0){let m=tp.SCALAR,y=ro[s.sparse.indices.componentType],M=s.sparse.indices.byteOffset||0,x=s.sparse.values.byteOffset||0,T=new y(a[1],M,s.sparse.count*m),S=new c(a[2],x,s.sparse.count*l);o!==null&&(v=new nt(v.array.slice(),v.itemSize,v.normalized)),v.normalized=!1;for(let b=0,w=T.length;b<w;b++){let L=T[b];if(v.setX(L,S[b*l]),l>=2&&v.setY(L,S[b*l+1]),l>=3&&v.setZ(L,S[b*l+2]),l>=4&&v.setW(L,S[b*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}v.normalized=g}return v})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);let d=(r.samplers||{})[a.sampler]||{};return h.magFilter=bv[d.magFilter]||Gt,h.minFilter=bv[d.minFilter]||Sn,h.wrapS=xv[d.wrapS]||Gi,h.wrapT=xv[d.wrapT]||Gi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==jt&&h.minFilter!==Gt,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1,h;if(t.isKTX2Loader===!0&&a.bufferView!==void 0)h=n.getDependency("bufferView",a.bufferView).then(function(d){return new Promise(function(p,g){t.parse(d,p,g)})});else{if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(d){c=!0;let p=new Blob([d],{type:a.mimeType});return l=o.createObjectURL(p),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");h=Promise.resolve(l).then(function(d){return new Promise(function(p,g){let _=p;t.isImageBitmapLoader===!0&&(_=function(v){let m=new rn(v);m.needsUpdate=!0,p(m)}),t.load(Ss.resolveURL(d,r.path),_,void 0,g)})})}let u=h.then(function(d){return c===!0&&o.revokeObjectURL(l),Qi(d,a),d.userData.mimeType=a.mimeType||fw(a.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ht.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[ht.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[ht.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Na,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Fa,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Yn}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[ht.KHR_MATERIALS_UNLIT]){let u=s[ht.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{let u=r.pbrMetallicRoughness||{};if(o.color=new Ee(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Dn),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,Ht)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=Mn);let h=r.alphaMode||np.OPAQUE;if(h===np.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===np.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==pn&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new He(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==pn&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==pn){let u=r.emissiveFactor;o.emissive=new Ee().setRGB(u[0],u[1],u[2],Dn)}return r.emissiveTexture!==void 0&&a!==pn&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Ht)),Promise.all(c).then(function(){let u=new a(o);return r.name&&(u.name=r.name),Qi(u,r),t.associations.set(u,{materials:e}),r.extensions&&Jr(s,u,r),u})}createUniqueName(e){let t=Rt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[ht.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return yv(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],h=dw(c),u=s[h];if(u)a.push(u.promise);else{let d;c.extensions&&c.extensions[ht.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=yv(new Ct,c,t),c.mode===_i.TRIANGLE_STRIP?d=d.then(p=>ep(p,ol)):c.mode===_i.TRIANGLE_FAN&&(d=d.then(p=>ep(p,Wa))),s[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let h=a[l].material===void 0?cw(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let p=0,g=h.length;p<g;p++){let _=h[p],v=a[p],m,y=c[p];if(v.mode===_i.TRIANGLES||v.mode===_i.TRIANGLE_STRIP||v.mode===_i.TRIANGLE_FAN||v.mode===void 0){let M=r.isSkinnedMesh===!0,x=_.hasAttribute("skinIndex")&&_.hasAttribute("skinWeight");M&&x===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=M&&x?new Fr(_,y):new Et(_,y),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(v.mode===_i.LINES)m=new Oo(_,y);else if(v.mode===_i.LINE_STRIP)m=new Nr(_,y);else if(v.mode===_i.LINE_LOOP)m=new ko(_,y);else if(v.mode===_i.POINTS)m=new tr(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+v.mode);Object.keys(m.geometry.morphAttributes).length>0&&uw(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Qi(m,r),v.extensions&&Jr(s,m,v),t.assignFinalMaterial(m),u.push(m)}for(let p=0,g=u.length;p<g;p++)t.associations.set(u[p],{meshes:e,primitives:p});if(u.length===1)return r.extensions&&Jr(s,u[0],r),u[0];let d=new Xt;r.extensions&&Jr(s,d,r),t.associations.set(d,{meshes:e});for(let p=0,g=u.length;p<g;p++)d.add(u[p]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new sn(Uh.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new hi(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Qi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,h=a.length;c<h;c++){let u=a[c];if(u){o.push(u);let d=new ke;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Uo(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let p=s.channels[u],g=s.samplers[p.sampler],_=p.target,v=_.node,m=s.parameters!==void 0?s.parameters[g.input]:g.input,y=s.parameters!==void 0?s.parameters[g.output]:g.output;_.node!==void 0&&(a.push(this.getDependency("node",v)),o.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",y)),c.push(g),h.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let d=u[0],p=u[1],g=u[2],_=u[3],v=u[4],m=[];for(let M=0,x=d.length;M<x;M++){let T=d[M],S=p[M],b=g[M],w=_[M],L=v[M];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();let P=n._createAnimationTracks(T,S,b,w,L);if(P)for(let F=0;F<P.length;F++)m.push(P[F])}let y=new Br(r,void 0,m);return Qi(y,s),y})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(p){p.isSkinnedMesh&&p.bind(d,pw)});for(let p=0,g=u.length;p<g;p++)h.add(u[p]);if(h.userData.pivot!==void 0&&u.length>0){let p=h.userData.pivot,g=u[0];h.pivot=new C().fromArray(p),h.position.x-=p[0],h.position.y-=p[1],h.position.z-=p[2],g.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(r.isBone===!0?h=new La:c.length>1?h=new Xt:c.length===1?h=c[0]:h=new Tt,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=a),Qi(h,r),r.extensions&&Jr(n,h,r),r.matrix!==void 0){let u=new ke;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Xt;n.name&&(r.name=s.createUniqueName(n.name)),Qi(r,n),n.extensions&&Jr(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++){let d=l[h];d.parent!==null?r.add(mu(d)):r.add(d)}let c=h=>{let u=new Map;for(let[d,p]of s.associations)(d instanceof kn||d instanceof rn)&&u.set(d,p);return h.traverse(d=>{let p=s.associations.get(d);p!=null&&u.set(d,p)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];function c(p){p.morphTargetInfluences&&l.push(p.name?p.name:p.uuid)}hr[r.path]===hr.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(o);let h;switch(hr[r.path]){case hr.weights:h=bs;break;case hr.rotation:h=xs;break;case hr.translation:case hr.scale:h=nr;break;default:n.itemSize===1?h=bs:h=nr;break}let u=s.interpolation!==void 0?lw[s.interpolation]:Ir,d=this._getArrayFromAccessor(n);for(let p=0,g=l.length;p<g;p++){let _=new h(l[p]+"."+hr[r.path],t.array,d,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),a.push(_)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Rp(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof xs?Ep:bu;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function mw(i,e,t){let n=e.attributes,s=new Kn;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new C(l[0],l[1],l[2]),new C(c[0],c[1],c[2])),o.normalized){let h=Rp(ro[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new C,l=new C;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],p=d.min,g=d.max;if(p!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(p[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(p[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(p[2]),Math.abs(g[2]))),d.normalized){let _=Rp(ro[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new _n;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function yv(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=Ap[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return ct.workingColorSpace!==Dn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ct.workingColorSpace}" not supported.`),Qi(i,e),mw(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?hw(i,e.targets,t):i})}var Mv=(function(){var i="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuixkbeeeddddillviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WboY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbrl79IV9Rbwq:VZkdbk:XYi5ud9:du8Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaicefhxcj;abad9Uc;WFbGcjdadca0EhmaialfgPar9Rgoadfhsavaoadz:jjjjbgzceVhHcbhOdndninaeaO9nmeaPax9RaD6mdamaeaO9RaOamfgoae6EgAcsfglc9WGhCabaOad2fhXaAcethQaxaDfhiaOaeaoaeao6E9RhLalcl4cifcd4hKazcj;cbfaAfhYcbh8AazcjdfhEaHh3incbh5dnawTmbaxa8Acd4fRbbh5kcbh8Eazcj;cbfhqinaih8Fdndndndna5a8Ecet4ciGgoc9:fPdebdkaPa8F9RaA6mrazcj;cbfa8EaA2fa8FaAz:jjjjb8Aa8FaAfhixdkazcj;cbfa8EaA2fcbaAz:kjjjb8Aa8FhixekaPa8F9RaK6mva8FaKfhidnaCTmbaPai9RcK6mbaocdtc:q:G:cjbfcj:G:cjbawEhaczhrcbhlinargoc9Wfghaqfhrdndndndndndnaaa8Fahco4fRbbalcoG4ciGcdtfydbPDbedvivvvlvkar9cb83bwar9cb83bbxlkarcbaiRbdai8Xbb9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbaqaofgrcGfcbaicdfa8J9c8N1:NfghRbbag9cjjjjjw:dg8J9qE86bbarcVfcbaha8J9c8M1:NfghRbbag9cjjjjjl:dg8J9qE86bbarc7fcbaha8J9c8L1:NfghRbbag9cjjjjjd:dg8J9qE86bbarctfcbaha8J9c8K1:NfghRbbag9cjjjjje:dg8J9qE86bbarc91fcbaha8J9c8J1:NfghRbbag9cjjjj;ab:dg8J9qE86bbarc4fcbaha8J9cg1:NfghRbbag9cjjjja:dg8J9qE86bbarc93fcbaha8J9ch1:NfghRbbag9cjjjjz:dgg9qE86bbarc94fcbahag9ca1:NfghRbbai8Xbe9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbarc95fcbaha8J9c8N1:NfgiRbbag9cjjjjjw:dg8J9qE86bbarc96fcbaia8J9c8M1:NfgiRbbag9cjjjjjl:dg8J9qE86bbarc97fcbaia8J9c8L1:NfgiRbbag9cjjjjjd:dg8J9qE86bbarc98fcbaia8J9c8K1:NfgiRbbag9cjjjjje:dg8J9qE86bbarc99fcbaia8J9c8J1:NfgiRbbag9cjjjj;ab:dg8J9qE86bbarc9:fcbaia8J9cg1:NfgiRbbag9cjjjja:dg8J9qE86bbarcufcbaia8J9ch1:NfgiRbbag9cjjjjz:dgg9qE86bbaiag9ca1:NfhixikaraiRblaiRbbghco4g8Ka8KciSg8KE86bbaqaofgrcGfaiclfa8Kfg8KRbbahcl4ciGg8La8LciSg8LE86bbarcVfa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc7fa8Ka8Lfg8KRbbahciGghahciSghE86bbarctfa8Kahfg8KRbbaiRbeghco4g8La8LciSg8LE86bbarc91fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc4fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc93fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc94fa8Kahfg8KRbbaiRbdghco4g8La8LciSg8LE86bbarc95fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc96fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc97fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc98fa8KahfghRbbaiRbigico4g8Ka8KciSg8KE86bbarc99faha8KfghRbbaicl4ciGg8Ka8KciSg8KE86bbarc9:faha8KfghRbbaicd4ciGg8Ka8KciSg8KE86bbarcufaha8KfgrRbbaiciGgiaiciSgiE86bbaraifhixdkaraiRbwaiRbbghcl4g8Ka8KcsSg8KE86bbaqaofgrcGfaicwfa8Kfg8KRbbahcsGghahcsSghE86bbarcVfa8KahfghRbbaiRbeg8Kcl4g8La8LcsSg8LE86bbarc7faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarctfaha8KfghRbbaiRbdg8Kcl4g8La8LcsSg8LE86bbarc91faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc4faha8KfghRbbaiRbig8Kcl4g8La8LcsSg8LE86bbarc93faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc94faha8KfghRbbaiRblg8Kcl4g8La8LcsSg8LE86bbarc95faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc96faha8KfghRbbaiRbvg8Kcl4g8La8LcsSg8LE86bbarc97faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc98faha8KfghRbbaiRbog8Kcl4g8La8LcsSg8LE86bbarc99faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc9:faha8KfghRbbaiRbrgicl4g8Ka8KcsSg8KE86bbarcufaha8KfgrRbbaicsGgiaicsSgiE86bbaraifhixekarai8Pbw83bwarai8Pbb83bbaiczfhikdnaoaC9pmbalcdfhlaoczfhraPai9RcL0mekkaoaC6moaimexokaCmva8FTmvkaqaAfhqa8Ecefg8Ecl9hmbkdndndndnawTmbasa8Acd4fRbbgociGPlbedrbkaATmdaza8Afh8Fazcj;cbfhhcbh8EaEhaina8FRbbhraahocbhlinaoahalfRbbgqce4cbaqceG9R7arfgr86bbaoadfhoaAalcefgl9hmbkaacefhaa8Fcefh8FahaAfhha8Ecefg8Ecl9hmbxikkaATmeaza8Afhaazcj;cbfhhcbhoceh8EaYh8FinaEaofhlaa8Vbbhrcbhoinala8FaofRbbcwtahaofRbbgqVc;:FiGce4cbaqceG9R7arfgr87bbaladfhlaLaocefgofmbka8FaQfh8FcdhoaacdfhaahaQfhha8EceGhlcbh8EalmbxdkkaATmbaocl4h8Eaza8AfRbbhqcwhoa3hlinalRbbaotaqVhqalcefhlaocwfgoca9hmbkcbhhaEh8FaYhainazcj;cbfahfRbbhrcwhoaahlinalRbbaotarVhralaAfhlaocwfgoca9hmbkara8E94aq7hqcbhoa8Fhlinalaqao486bbalcefhlaocwfgoca9hmbka8Fadfh8FaacefhaahcefghaA9hmbkkaEclfhEa3clfh3a8Aclfg8Aad6mbkaXazcjdfaAad2z:jjjjb8AazazcjdfaAcufad2fadz:jjjjb8AaAaOfhOaihxaimbkc9:hoxdkcbc99aPax9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaok:ysezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:kjjjb8Aav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk:4ioiue99dud99dud99dnaeTmbcbhiabhlindndnal8Uebgv:YgoJ:ji:1Salcof8UebgrciVgw:Y:vgDNJbbbZJbbb:;avcu9kEMgq:lJbbb9p9DTmbaq:Ohkxekcjjjj94hkkalclf8Uebhvalcdf8UebhxalarcefciGcetfak87ebdndnax:YgqaDNJbbbZJbbb:;axcu9kEMgm:lJbbb9p9DTmbam:Ohxxekcjjjj94hxkabaiarciGgkfcd7cetfax87ebdndnav:YgmaDNJbbbZJbbb:;avcu9kEMgP:lJbbb9p9DTmbaP:Ohvxekcjjjj94hvkalarcufciGcetfav87ebdndnawaw2:ZgPaPMaoaoN:taqaqN:tamamN:tgoJbbbbaoJbbbb9GE:raDNJbbbZMgD:lJbbb9p9DTmbaD:Ohrxekcjjjj94hrkalakcetfar87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk:Tvirud99eudndnadcl9hmbaeTmeindndnabRbbgiabcefgl8Sbbgvabcdfgo8Sbbgrf9R:YJbbuJabcifgwRbbgdce4adVgDcd4aDVgDcl4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax86bbdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao86bbdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai86bbdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad86bbabclfhbaecufgembxdkkaeTmbindndnab8Vebgiabcdfgl8Uebgvabclfgo8Uebgrf9R:YJbFu9habcofgw8Vebgdce4adVgDcd4aDVgDcl4aDVgDcw4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax87ebdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao87ebdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai87ebdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad87ebabcwfhbaecufgembkkk9teiucbcbyd:K:G:cjbgeabcifc98GfgbBd:K:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkk83dbcj:Gdk8Kbbbbdbbblbbbwbbbbbbbebbbdbbblbbbwbbbbc:K:Gdkl8W:qbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuixkbbebeeddddilve9Weeeviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WbwY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbDl79IV9Rbqq:W9Dklbzik94evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaeai86b:q:W:cjbaecitab8Piw83i:q:G:cjbaecefgecjd9hmbkk:JBl8Aud97dur978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaialfgxar9RhodnadTgmmbavaoad;8qbbkaicefhPcj;abad9Uc;WFbGcjdadca0EhsdndndnadTmbaoadfhzcbhHinaeaH9nmdaxaP9RaD6miabaHad2fhOaPaDfhAasaeaH9RaHasfae6EgCcsfgocl4cifcd4hXavcj;cbfaoc9WGgQcetfhLavcj;cbfaQci2fhKavcj;cbfaQfhYcbh8Aaoc;ab6hEincbh3dnawTmbaPa8Acd4fRbbh3kcbh5avcj;cbfh8Eindndndndna3a5cet4ciGgoc9:fPdebdkaxaA9RaQ6mwdnaQTmbavcj;cbfa5aQ2faAaQ;8qbbkaAaCfhAxdkaQTmeavcj;cbfa5aQ2fcbaQ;8kbxekaxaA9RaX6moaoclVcbawEhraAaXfhocbhidnaEmbaxao9Rc;Gb6mbcbhlina8EalfhidndndndndndnaAalco4fRbbgqciGarfPDbedibledibkaipxbbbbbbbbbbbbbbbbpklbxlkaiaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiaopbbbpklbaoczfhoxekaiaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcd4ciGarfPDbedibledibkaiczfpxbbbbbbbbbbbbbbbbpklbxlkaiczfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiczfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiczfaopbbbpklbaoczfhoxekaiczfaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcl4ciGarfPDbedibledibkaicafpxbbbbbbbbbbbbbbbbpklbxlkaicafaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaicafaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaicafaopbbbpklbaoczfhoxekaicafaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqco4arfPDbedibledibkaic8Wfpxbbbbbbbbbbbbbbbbpklbxlkaic8Wfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaoclffaqRb:q:W:cjbfhoxikaic8Wfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaocwffaqRb:q:W:cjbfhoxdkaic8Wfaopbbbpklbaoczfhoxekaic8WfaopbbdaoRbbgicitpbi:q:G:cjbaiRb:q:W:cjbgipsaoRbegqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbaiaocdffaqRb:q:W:cjbfhokalc;abfhialcjefaQ0meaihlaxao9Rc;Fb0mbkkdnaiaQ9pmbaici4hlinaxao9RcK6mwa8EaifhqdndndndndndnaAaico4fRbbalcoG4ciGarfPDbedibledibkaqpxbbbbbbbbbbbbbbbbpkbbxlkaqaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaoclffagRb:q:W:cjbfhoxikaqaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaocwffagRb:q:W:cjbfhoxdkaqaopbbbpkbbaoczfhoxekaqaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpkbbahaocdffagRb:q:W:cjbfhokalcdfhlaiczfgiaQ6mbkkaohAaoTmoka8EaQfh8Ea5cefg5cl9hmbkdndndndnawTmbaza8Acd4fRbbglciGPlbedwbkaQTmdavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep9Ta8Fpxeeeeeeeeeeeeeeeegap9op9Hp9rg8Fa8Jp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ugap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp9Ugap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp9Ugap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9AbbbaladfhlaoczfgoaQ6mbxikkaQTmeavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep:nea8Fpxebebebebebebebebgap9op:bep9rg8Fa8Jp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oegap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp:oegap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp:oegap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9AbbbaladfhlaoczfgoaQ6mbxdkkaQTmbcbhocbalcl4gl9Rc8FGhiavcjdfa8Afhrava8Afpbdbhainaravcj;cbfaofpblbg8JaYaofpblbg8KpmbzeHdOiAlCvXoQrLg8LaLaofpblbg8MaKaofpblbg8NpmbzeHdOiAlCvXoQrLgypmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Faap9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8LaypmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwKDYq8AkEx3m5P8Es8Fg8Ja8Ma8NpmwKDYq8AkEx3m5P8Es8Fg8KpmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9AbbbaradfhraoczfgoaQ6mbkka8Aclfg8Aad6mbkdnaCad2goTmbaOavcjdfao;8qbbkdnammbavavcjdfaCcufad2fad;8qbbkaCaHfhHc9:hoaAhPaAmbxlkkaeTmbaDalfhrcbhocuhlinaralaD9RglfaD6mdasaeao9Raoasfae6Eaofgoae6mbkaial9RhPkcbc99axaP9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaokwbz:bjjjbkNsezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk;Toio97eue97aec98Ghedndnadcl9hmbaeTmecbhdinababpbbbgicKp:RecKp:Sep;6eglaicwp:RecKp:Sep;6ealp;Geaiczp:RecKp:Sep;6egvp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgwp9op9rp;Keglpxbb;:9cbb;:9cbb;:9cbb;:9calalp;Meaoaop;Meavaravawp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFbbbFbbbFbbbFbbbp9oaipxbbbFbbbFbbbFbbbFp9op9qalavp;Mearp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaoavp;Mearp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgDaDpbbbgipxbbbbbbFFbbbbbbFFgwp9oabpbbbgoaipmbediwDqkzHOAKY8AEgvczp:Reczp:Sep;6eglaoaipmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eavczp:Sep;6egvp;Gealp;Gep;Kep;Legipxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgqp9op9rp;Keglpxb;:FSb;:FSb;:FSb;:FSalalp;Meaiaip;Meavaravaqp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbp9oaiavp;Mearp;Keczp:Rep9qgialavp;Mearp;KepxFFbbFFbbFFbbFFbbp9oglpmwDKYqk8AExm35Ps8E8Fp9qpkbbabaoawp9oaialpmbezHdiOAlvCXorQLp9qpkbbabcafhbadclfgdae6mbkkk;2ileue97euo97dnaec98GgiTmbcbheinabcKfpx:ji:1S:ji:1S:ji:1S:ji:1SabpbbbglabczfgvpbbbgopmlvorxmPsCXQL358E8Fgrczp:Segwpxibbbibbbibbbibbbp9qp;6egDp;NegqaDaDp;MegDaDp;KealaopmbediwDqkzHOAKY8AEgDczp:Reczp:Sep;6eglalp;MeaDczp:Sep;6egoaop;Mearczp:Reczp:Sep;6egrarp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jep;Mepxbbn0bbn0bbn0bbn0gDp;KepxFFbbFFbbFFbbFFbbgkp9oaqaop;MeaDp;Keczp:Rep9qgoaqalp;MeaDp;Keakp9oaqarp;MeaDp;Keczp:Rep9qgDpmwDKYqk8AExm35Ps8E8Fglp5eawclp:RegqpEi:T:j83ibavalp5baqpEd:T:j83ibabcwfaoaDpmbezHdiOAlvCXorQLgDp5eaqpEe:T:j83ibabaDp5baqpEb:T:j83ibabcafhbaeclfgeai6mbkkkuee97dnadcd4ae2c98GgeTmbcbhdinababpbbbgicwp:Recwp:Sep;6eaicep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbabczfhbadclfgdae6mbkkk:Sodw97euaec98Ghedndnadcl9hmbaeTmecbhdinabpxbbuJbbuJbbuJbbuJabpbbbgicKp:TeglaicYp:Tep9qgvcdp:Teavp9qgvclp:Teavp9qgop;6ep;Negvaicwp:RecKp:SegraipxFbbbFbbbFbbbFbbbgwp9ogDp:Uep;6ep;Mepxbbn0bbn0bbn0bbn0gqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9oavaDarp:Xeaiczp:RecKp:Segip:Uep;6ep;Meaqp;Keawp9op9qavaDaraip:Uep:Xep;6ep;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qavaoalcep:Rep9oalpxebbbebbbebbbebbbp9op9qp;6ep;Meaqp;KecKp:Rep9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgkpxbFu9hbFu9hbFu9hbFu9habpbbbglakpbbbgrpmlvorxmPsCXQL358E8Fgvczp:TegqavcHp:Tep9qgicdp:Teaip9qgiclp:Teaip9qgicwp:Teaip9qgop;6ep;NegialarpmbediwDqkzHOAKY8AEgDpxFFbbFFbbFFbbFFbbglp9ograDczp:Segwp:Ueavczp:Reczp:SegDp:Xep;6ep;Mepxbbn0bbn0bbn0bbn0gvp;Kealp9oaiarawaDp:Uep:Xep;6ep;Meavp;Keczp:Rep9qgwaiaoaqcep:Rep9oaqpxebbbebbbebbbebbbp9op9qp;6ep;Meavp;Keczp:ReaiaDarp:Uep;6ep;Meavp;Kealp9op9qgipmwDKYqk8AExm35Ps8E8FpkbbabawaipmbezHdiOAlvCXorQLpkbbabcafhbadclfgdae6mbkkk9teiucbcbydj:G:cjbgeabcifc98GfgbBdj:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkxebcj:Gdklz:zbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var s=WebAssembly.validate(t)?o(e):o(i),r,a=WebAssembly.instantiate(s,{}).then(function(m){r=m.instance,r.exports.__wasm_call_ctors()});function o(m){for(var y=new Uint8Array(m.length),M=0;M<m.length;++M){var x=m.charCodeAt(M);y[M]=x>96?x-97:x>64?x-39:x+4}for(var T=0,M=0;M<m.length;++M)y[T++]=y[M]<60?n[y[M]]:(y[M]-60)*64+y[++M];return y.buffer.slice(0,T)}function l(m,y,M,x,T,S,b){var w=m.exports.sbrk,L=x+3&-4,P=w(L*T),F=w(S.length),O=new Uint8Array(m.exports.memory.buffer);O.set(S,F);var z=y(P,x,T,F,S.length);if(z==0&&b&&b(P,L,T),M.set(O.subarray(P,P+x*T)),w(P-w(0)),z!=0)throw new Error("Malformed buffer data: "+z)}var c={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp",COLOR:"meshopt_decodeFilterColor"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},u=[],d=0;function p(m){var y={object:new Worker(m),pending:0,requests:{}};return y.object.onmessage=function(M){var x=M.data;y.pending-=x.count,y.requests[x.id][x.action](x.value),delete y.requests[x.id]},y}function g(m){for(var y="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(s)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+v.name+";"+l.toString()+v.toString(),M=new Blob([y],{type:"text/javascript"}),x=URL.createObjectURL(M),T=u.length;T<m;++T)u[T]=p(x);for(var T=m;T<u.length;++T)u[T].object.postMessage({});u.length=m,URL.revokeObjectURL(x)}function _(m,y,M,x,T){for(var S=u[0],b=1;b<u.length;++b)u[b].pending<S.pending&&(S=u[b]);return new Promise(function(w,L){var P=new Uint8Array(M),F=++d;S.pending+=m,S.requests[F]={resolve:w,reject:L},S.object.postMessage({id:F,count:m,size:y,source:P,mode:x,filter:T},[P.buffer])})}function v(m){var y=m.data;self.ready.then(function(M){if(!y.id)return self.close();try{var x=new Uint8Array(y.count*y.size);l(M,M.exports[y.mode],x,y.count,y.size,y.source,M.exports[y.filter]),self.postMessage({id:y.id,count:y.count,action:"resolve",value:x},[x.buffer])}catch(T){self.postMessage({id:y.id,count:y.count,action:"reject",value:T})}})}return{ready:a,supported:!0,useWorkers:function(m){g(m)},decodeVertexBuffer:function(m,y,M,x,T){l(r,r.exports.meshopt_decodeVertexBuffer,m,y,M,x,r.exports[c[T]])},decodeIndexBuffer:function(m,y,M,x){l(r,r.exports.meshopt_decodeIndexBuffer,m,y,M,x)},decodeIndexSequence:function(m,y,M,x){l(r,r.exports.meshopt_decodeIndexSequence,m,y,M,x)},decodeGltfBuffer:function(m,y,M,x,T,S){l(r,r.exports[h[T]],m,y,M,x,r.exports[c[S]])},decodeGltfBufferAsync:function(m,y,M,x,T){return u.length>0?_(m,y,M,h[x],c[T]):a.then(function(){var S=new Uint8Array(m*y);return l(r,r.exports[h[x]],S,m,y,M,r.exports[c[T]]),S})}}})();var Pp=new Map,gw=/^(light_|screen|flame|window_glow)/,Sv=/^(light_|screen|flame|window_glow|glass_clear|solar_cell|void)/,Ls=null;function wv(){return Ls||(Ls=new Yn({vertexColors:!0,metalness:1,roughness:1}),Ls.name="plain",Ls.envMapIntensity=1.15,Ls.userData.modelMaterial=!0,Ls.onBeforeCompile=i=>{i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
attribute vec2 aPbr;
varying vec2 vPbr;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vPbr = aPbr;`),i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
varying vec2 vPbr;`).replace("#include <roughnessmap_fragment>","float roughnessFactor = clamp(vPbr.x, 0.05, 1.0);").replace("#include <metalnessmap_fragment>","float metalnessFactor = clamp(vPbr.y, 0.0, 1.0);")},Ls.customProgramCacheKey=()=>"plain-pbr",Ls)}function Tv(i,e,t,n){let s=new Ct,r=i.attributes.position,a=i.attributes.normal,o=i.attributes.color,l=new Float32Array(r.count*3),c=new Float32Array(r.count*3),h=new Float32Array(r.count*3);for(let d=0;d<r.count;d++){l[d*3]=r.getX(d),l[d*3+1]=r.getY(d),l[d*3+2]=r.getZ(d),a&&(c[d*3]=a.getX(d),c[d*3+1]=a.getY(d),c[d*3+2]=a.getZ(d));let p=o?o.getX(d):1;h[d*3]=(e?e.r:1)*p,h[d*3+1]=(e?e.g:1)*(o?o.getY(d):1),h[d*3+2]=(e?e.b:1)*(o?o.getZ(d):1)}s.setAttribute("position",new nt(l,3)),s.setAttribute("normal",new nt(c,3)),s.setAttribute("color",new nt(h,3));let u=new Float32Array(r.count*2);for(let d=0;d<r.count;d++)u[d*2]=t,u[d*2+1]=n;return s.setAttribute("aPbr",new nt(u,2)),i.index&&s.setIndex(new nt(Uint32Array.from(i.index.array),1)),s}function vw(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(s=>{if(!s.isMesh||s.isSkinnedMesh||Array.isArray(s.material))return;let r=s.parent;for(;r&&r!==i&&!(r.userData&&r.userData.part);)r=r.parent;r=r||i;let a=s.material,o=Sv.test(a.name||"")||a.transparent||a.map,l=o?a:wv();e.has(r)||e.set(r,new Map);let c=e.get(r);c.has(l)||c.set(l,[]),c.get(l).push({mesh:s,bake:!o})});let t=new ke,n=new ke;for(let[s,r]of e){t.copy(s.matrixWorld).invert();for(let[a,o]of r){let l=o.map(({mesh:u,bake:d})=>{let p=Tv(u.geometry,d?u.material.color:null,u.material.roughness,u.material.metalness);return p.applyMatrix4(n.multiplyMatrices(t,u.matrixWorld)),p}),c=l.length===1?l[0]:Qf(l,!1);if(!c)continue;c.computeBoundingSphere(),o[0].bake||(a.vertexColors=!0,a.needsUpdate=!0,c.deleteAttribute("aPbr"));let h=new Et(c,a);h.name=(s.name||"model")+":"+(a.name||"m");for(let{mesh:u}of o)u.parent.remove(u),u.geometry.dispose();s.add(h)}}}function bw(i){let e=[];i.traverse(o=>{o.isSkinnedMesh&&!Array.isArray(o.material)&&e.push(o)});let t=e.filter(o=>!(Sv.test(o.material.name||"")||o.material.transparent||o.material.map));if(t.length<2)return;let n=t[0];if(!t.every(o=>o.parent===n.parent&&o.skeleton.bones.length===n.skeleton.bones.length))return;let s=t.map(o=>{let l=Tv(o.geometry,o.material.color,o.material.roughness,o.material.metalness),c=o.geometry.attributes.skinIndex,h=o.geometry.attributes.skinWeight,u=new Uint16Array(c.count*4),d=new Float32Array(c.count*4);for(let p=0;p<c.count;p++)u[p*4]=c.getX(p),u[p*4+1]=c.getY(p),u[p*4+2]=c.getZ(p),u[p*4+3]=c.getW(p),d[p*4]=h.getX(p),d[p*4+1]=h.getY(p),d[p*4+2]=h.getZ(p),d[p*4+3]=h.getW(p);return l.setAttribute("skinIndex",new nt(u,4)),l.setAttribute("skinWeight",new nt(d,4)),l}),r=Qf(s,!1);if(!r)return;let a=new Fr(r,wv());a.name="body",a.frustumCulled=!1,n.parent.add(a),a.bind(n.skeleton,n.bindMatrix);for(let o of t)o.parent.remove(o),o.geometry.dispose()}function xw(i){let e=!1;i.scene.traverse(n=>{n.isSkinnedMesh&&(e=!0)}),e?bw(i.scene):vw(i.scene);let t=new Set;return i.scene.traverse(n=>{if(n.isSkinnedMesh&&(e=!0,n.frustumCulled=!1),!n.isMesh)return;n.castShadow=!0,n.receiveShadow=!0;let s=Array.isArray(n.material)?n.material:[n.material];for(let r of s){if(t.has(r))continue;t.add(r);let a=r.name||"";a.startsWith("glass_clear")?(r.transparent=!0,r.depthWrite=!1,r.opacity=.28,r.roughness=.06,r.metalness=0,r.envMapIntensity=1.6,r.side=Mn,n.castShadow=!1):gw.test(a)?(r.toneMapped=!0,r.userData.baseEmissive=r.emissiveIntensity||1,n.castShadow=!1):a==="void"?(r.color.set(0),r.roughness=1):a.startsWith("solar_cell")&&(n.castShadow=!1),r.metalness>.5&&(r.envMapIntensity=1.25),r.userData.modelMaterial=!0}}),{scene:i.scene,animations:i.animations||[],skinned:e}}async function Ev(i,e){let t=new gu;t.setMeshoptDecoder(Mv);let n=0,s=[];return await Promise.all(i.map(async r=>{if(!Pp.has(r)){let a=await t.loadAsync(lr(`assets/models/${r}.glb`));Pp.set(r,xw(a))}s.push(r),n++,e&&e(n/i.length)})),s}function ti(i,e={}){let t=Pp.get(i);if(!t)throw new Error(`Model not loaded: ${i}`);let n=t.skinned?mu(t.scene):t.scene.clone(!0);e.face&&(n.rotation.y=Math.PI);let s=new Xt;return s.name=i,s.add(n),{root:s,part:a=>n.getObjectByName(a),clips:t.animations,inner:n}}function Ds(i,e){let t=[];if(!i)return t;let n=s=>{if(e&&!e.test(s.name||""))return s;let r=s.clone();return r.userData={...s.userData},t.push(r),r};return i.traverse(s=>{s.isMesh&&(s.material=Array.isArray(s.material)?s.material.map(n):n(s.material))}),t}function es(i,e){for(let t of i)t.userData.baseEmissive!==void 0&&(t.emissiveIntensity=t.userData.baseEmissive*e)}function Ip(i){let e=[];return i.inner.traverse(t=>{t.name&&t.name.startsWith("col_")&&t.userData&&t.userData.radius&&e.push({name:t.name,x:t.position.x,z:t.position.z,r:t.userData.radius,node:t})}),e}var ur=[{name:"Tharsis Rise",lat:2,lon:247,r:2600,h:5.5,type:"bulge"},{name:"Olympus Mons",lat:18.65,lon:226.2,r:310,h:21.9,type:"volcano",cal:.09,note:"Tallest volcano in the solar system. The slopes are so gentle you could not see the summit from the base \u2014 the planet curves away first."},{name:"Ascraeus Mons",lat:11.92,lon:255.92,r:220,h:14.9,type:"volcano",cal:.1,note:'Northernmost of the Tharsis Montes. Its name means "rustic" \u2014 for a mountain twice the height of Everest.'},{name:"Pavonis Mons",lat:1.48,lon:247.04,r:190,h:8.4,type:"volcano",cal:.12,note:"Sits almost exactly on the equator. A space elevator dream site, if Mars ever files the permits."},{name:"Arsia Mons",lat:-8.35,lon:239.91,r:220,h:11.7,type:"volcano",cal:.16,note:"Has a caldera you could drop a small country into, and cave skylights along its flanks."},{name:"Alba Mons",lat:40.5,lon:250.4,r:600,h:6.8,type:"volcano",cal:.07,note:"The biggest volcano by area anywhere \u2014 a pancake 1000+ km across that you could drive over without noticing the summit."},{name:"Elysium Mons",lat:25.02,lon:147.21,r:210,h:14.1,type:"volcano",cal:.09,note:"The lonely giant of the eastern hemisphere, far from the Tharsis crowd."},{name:"Hecates Tholus",lat:32.12,lon:150.24,r:90,h:4.8,type:"volcano",cal:.12,note:"Small by Mars standards. Merely enormous by Earth standards."},{name:"Hellas Planitia",lat:-42.4,lon:70.5,r:1050,h:-7.2,type:"basin",note:"Deepest hole on Mars \u2014 the air at the bottom is thick enough that liquid water could briefly survive. Briefly."},{name:"Argyre Planitia",lat:-49.7,lon:316,r:450,h:-5.2,type:"basin",note:"An ancient impact scar ringed by mountains. Named for a mythical island of silver."},{name:"Isidis Planitia",lat:12.9,lon:87,r:380,h:-3.7,type:"basin",note:"Third-largest impact basin. Beagle 2 sleeps here, half-opened, like a stood-up date."},{name:"Utopia Planitia",lat:46.7,lon:117.5,r:830,h:-4.1,type:"basin",note:"Largest recognized impact basin in the solar system. Also where Starfleet will someday build ships, allegedly."},{name:"Gale Crater",lat:-5.4,lon:137.8,r:77,h:-3.8,type:"crater",peak:2.8,note:"Home of Mount Sharp and one very hardworking nuclear-powered robot geologist."},{name:"Jezero Crater",lat:18.44,lon:77.45,r:24,h:-2.5,type:"crater",note:"An ancient river delta. Perseverance is here, caching rocks and minding a helicopter."},{name:"Gusev Crater",lat:-14.57,lon:175.48,r:83,h:-1.9,type:"crater",note:"Spirit's home. She drove backwards for years, dragging a bad wheel, and found ancient hot springs doing it."},{name:"Schiaparelli Crater",lat:-2.71,lon:16.77,r:230,h:-2.2,type:"crater",note:'Named for the astronomer whose "canali" got mistranslated into canals and a century of Martian fever dreams.'},{name:"Huygens Crater",lat:-13.88,lon:55.58,r:234,h:-2.5,type:"crater",note:"The largest well-preserved crater on Mars, sitting on some of the oldest crust anywhere."},{name:"Cassini Crater",lat:23.82,lon:32.12,r:205,h:-1.8,type:"crater",note:"A vast, soft-shouldered ruin in Arabia Terra. Old enough to have forgotten its own impact."},{name:"Lyot Crater",lat:50.47,lon:29.32,r:110,h:-3,type:"crater",note:"The deepest point in the northern hemisphere. Bring a flashlight and a coat."},{name:"Korolev Crater",lat:72.77,lon:164.58,r:41,h:-2,type:"crater",ice:!0,note:"Permanently full of water ice, 1800 cubic kilometers of it \u2014 a frozen lake the size of a small sea."},{name:"Noctis Labyrinthus",lat:-6.9,lon:261,r:120,h:-4.5,type:"canyon",to:{lat:-8,lon:267},note:"The Labyrinth of Night: a shattered maze of canyons where Valles Marineris begins."},{name:"Ius Chasma",lat:-7.5,lon:269,r:55,h:-6.5,type:"canyon",to:{lat:-9,lon:279},note:"Twin parallel troughs carved deeper than four Grand Canyons stacked."},{name:"Melas Chasma",lat:-10,lon:283,r:90,h:-7,type:"canyon",to:{lat:-11,lon:290},note:"The widest heart of Valles Marineris. The canyon floor has its own weather."},{name:"Coprates Chasma",lat:-12.5,lon:293,r:60,h:-6.8,type:"canyon",to:{lat:-14,lon:304},note:"Nearly 1000 km of unbroken chasm. The walls rise 8 km \u2014 you cannot see the top from the floor."},{name:"Eos Chasma",lat:-13,lon:307,r:70,h:-5.2,type:"canyon",to:{lat:-10,lon:315},note:"Where the great canyon exhales into chaos terrain and ancient flood channels."},{name:"Capri Chasma",lat:-8.5,lon:313,r:60,h:-4.2,type:"canyon",to:{lat:-4,lon:318},note:"The canyon's outlet ramp, spilling toward the lowlands that once may have held a sea."},{name:"Planum Boreum",lat:90,lon:0,r:600,h:2.2,type:"cap",note:"The northern ice cap: water ice, spiral troughs, and winter air that freezes out of the sky."},{name:"Planum Australe",lat:-90,lon:0,r:500,h:3,type:"cap",note:"The southern cap, taller and colder. Radar hints at buried brine lakes beneath."},{name:"Syrtis Major",lat:8.4,lon:69.5,r:600,h:1,type:"albedo",note:"The dark patch telescopes have watched since 1659 \u2014 the oldest continuously observed feature on any other planet."}],xu=[{name:"Acidalia Planitia",lat:49.8,lon:339.3,r:27},{name:"Chryse Planitia",lat:28.4,lon:319.7,r:18},{name:"Amazonis Planitia",lat:24.8,lon:196,r:20},{name:"Arcadia Planitia",lat:47.2,lon:184.3,r:19},{name:"Elysium Planitia",lat:3,lon:154.7,r:18},{name:"Arabia Terra",lat:22.8,lon:5,r:26},{name:"Terra Sabaea",lat:-2,lon:42,r:22},{name:"Noachis Terra",lat:-45,lon:350,r:25},{name:"Terra Sirenum",lat:-39.7,lon:205.8,r:24},{name:"Terra Cimmeria",lat:-34.7,lon:145,r:24},{name:"Tempe Terra",lat:39.3,lon:289,r:16},{name:"Meridiani Planum",lat:-.2,lon:356.8,r:10},{name:"Vastitas Borealis",lat:68,lon:90,r:35},{name:"Ares Vallis",lat:16.5,lon:327.5,r:8}],yu=[{name:"Mars 3",lat:-45,lon:202,year:1971,scrap:2,note:"The first soft landing on Mars. It transmitted for 110 seconds, sent half a gray picture, and went silent forever. A poet."},{name:"Mars 6",lat:-23.9,lon:340.6,year:1974,scrap:2,note:"Transmitted all the way down and stopped at the surface. Its data described the air it died in."},{name:"Viking 1",lat:22.48,lon:312.05,year:1976,scrap:3,note:"First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences."},{name:"Viking 2",lat:47.97,lon:134.26,year:1976,scrap:3,note:"Landed on a rock and spent six years slightly tilted. Photographed frost. Never complained."},{name:"Pathfinder",lat:19.13,lon:326.79,year:1997,scrap:0,note:"The little lander that could \u2014 and its rover Sojourner, the size of a microwave, the courage of a battleship."},{name:"Beagle 2",lat:11.53,lon:90.43,year:2003,scrap:2,note:"Landed successfully, then two solar panels failed to open, hiding its antenna. Found 12 years later, almost fine. ALMOST."},{name:"Spirit",lat:-14.57,lon:175.47,year:2004,scrap:3,note:"Ninety-day mission; drove six years. Finally stuck in soft sand \u2014 which its dragging wheel had just revealed to be ancient hot-spring silica."},{name:"Opportunity",lat:-1.95,lon:354.47,year:2004,scrap:3,note:`Ninety-day mission; drove a marathon over 14 years. Last words, roughly: "My battery is low and it's getting dark."`},{name:"Phoenix",lat:68.22,lon:234.25,year:2008,scrap:3,note:"Dug up polar ice with a robot arm and watched snow fall on Mars. The Martian winter buried it in dry ice. Worth it."},{name:"Curiosity",lat:-4.59,lon:137.44,year:2012,scrap:2,note:'Nuclear-powered, laser-armed, sky-crane-delivered. Sang itself "Happy Birthday" alone in Gale Crater once. Once.'},{name:"Schiaparelli EDM",lat:-2.05,lon:353.79,year:2016,scrap:3,note:"A software hiccup convinced it the ground was above it. The crater it made is very geographically informative."},{name:"InSight",lat:4.5,lon:135.62,year:2018,scrap:3,note:"Listened to the heartbeat of Mars: over 1300 marsquakes. Its last selfie shows it covered in the dust that retired it."},{name:"Perseverance",lat:18.44,lon:77.45,year:2021,scrap:2,note:"Carries 43 sample tubes and brought a helicopter as carry-on. Ingenuity flew 72 times when it was rated for 5."},{name:"Zhurong",lat:25.07,lon:109.93,year:2021,scrap:2,note:"China's first Mars rover, named for a fire god, parked in Utopia. Hibernated for winter; the dust decided it should keep hibernating."}];for(let i of ur)i.v=Bt(i.lat,i.lon),i.angR=i.r/3389.5;for(let i of xu)i.v=Bt(i.lat,i.lon),i.angR=i.r*Rs;for(let i of yu)i.v=Bt(i.lat,i.lon);function _u(i){let e=null,t=1e9;for(let s of[xu,ur])for(let r of s){if(r.type==="bulge"||r.type==="albedo")continue;En(i.x,i.y,i.z,r.v.x,r.v.y,r.v.z)<r.angR&&r.angR<t&&(t=r.angR,e=r.name)}if(e)return e;let n=Qn(i);return n.lat>55?"Vastitas Borealis":n.lat<-60?"Southern Highlands":cv(i.x,i.y,i.z)<-1.5?"Northern Lowlands":"Cratered Highlands"}var R={plots:[],panels:[],soilPiles:[],landers:[],iceSites:[],builtMeshes:[],markers:[],pods:[]},fr=[],Dp=[];function ts(i,e,t){let n=new Xt;Dp.push(n);let s=i.isVector3?An.copy(i).normalize().clone():Bt(i,e),r=St(s);return n.position.copy(s).multiplyScalar(r),$i(s,t||0,n.quaternion),n.userData.up=s.clone(),ce.world.add(n),n}function Lp(i,e,t,n){let s=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position);fr.push({v:s.normalize().clone(),r:n})}var Wn=8.4,_w=.06,Av=.16;function Rv(i){for(let e=0;e<200;e++){let t=(i()*2-1)*52,n=i()*360,s=Bt(t,n);if(hv(s)>.28)continue;let r=Bt(19.13,326.79),a=Bt(-2.71,16.77);if(En(s.x,s.y,s.z,r.x,r.y,r.z)*12e3<2500||En(s.x,s.y,s.z,a.x,a.y,a.z)*12e3<2500)continue;let o=!1;for(let l of f.storm.cells||[]){let c=Bt(l.lat,l.lon);if(En(s.x,s.y,s.z,c.x,c.y,c.z)*12e3<l.r+2500){o=!0;break}}if(!o)return{lat:t,lon:n,v:s}}return{lat:18,lon:340,v:Bt(18,340)}}function Cv(i){R.hab=ts(i.lat,i.lon,0),R.hab.position.addScaledVector(R.hab.userData.up,-_w);let e=ti("hab");R.hab.add(e.root),R.habModel=e;for(let l of Ip(e)){l.node.updateWorldMatrix(!0,!1);let c=l.node.getWorldPosition(new C),h=R.hab.worldToLocal(c);Lp(R.hab,h.x,h.z,l.r)}R.beaconMats=Ds(e.part("beacon")),R.oxyMats=Ds(e.part("status_oxy")),R.commsMats=Ds(e.part("comms_screen")),R.hydFlame=e.part("hydrazine_flame"),R.breachHole=e.part("breach_hole"),R.breachPatch=e.part("breach_patch");for(let l of[R.hydFlame,R.breachHole,R.breachPatch])l&&(l.visible=!1);R.habInterior=e.part("interior"),R.habInterior&&R.habInterior.traverse(l=>{l.isMesh&&(l.castShadow=!1)}),R.hab.userData.reach=6e3,R.habFurnishings=new Xt,R.hab.add(R.habFurnishings),R.doors=["door_outer_L","door_outer_R","door_inner_L","door_inner_R"].map(l=>{let c=e.part(l);return c?{node:c,x0:c.position.x,dx:c.userData.open_dx||(l.endsWith("_L")?-1.05:1.05),k:0,outer:l.includes("outer")}:null}).filter(Boolean),R.habLights=[];let t=ce.engine.q.scale<.7?["light_0","light_2"]:["light_0","light_1","light_2","light_3"];for(let l of t){let c=e.part(l);if(!c)continue;let h=new zr(16770244,15,26,1.6);h.userData.on=15,c.add(h),R.habLights.push(h)}for(let l=0;l<6;l++){let c=-5.2+l%2*2,h=-3.2+Math.floor(l/2)*2.4;Dv(R.hab,c,h,!0,R.habFurnishings)}let n=dr(R.hab,-30,4,0);for(let l=0;l<8;l++){let c=-Math.floor(l/4)*5.5,h=l%4*4.6,u=new Xt;u.position.set(c,0,h),n.add(u);let d=ti("solar_panel");u.add(d.root);let p=Ds(d.part("panel")||d.root).filter(_=>_.name==="solar_cell"),g={mesh:d.part("panel")||d.root,cells:p,dust:.22+l*.05,group:u};Lp(n,c,h,1),R.panels.push(g)}R.solarGroup=n,Sw(dr(R.hab,15,15,2.6)),[[22,-8],[31,15],[-14,24],[8,27],[-24,-16],[16,-22]].forEach(([l,c],h)=>{let u=dr(R.hab,l,c,Zn(h,3,5)*6.28),d=Mi(u,"regolith_pile");R.soilPiles.push({mesh:d.part("heap"),group:u,left:2,cols:[Np(u,0,0,.85)]})});let s=dr(R.hab,11.5,7.5,0);s.add(ti("uplink_dish").root),R.uplink=s,fr.push({v:s.position.clone().normalize(),r:.8});let r=dr(R.hab,7,9.5,0),a=Mi(r,"uplink_pad");R.padLampMats=Ds(a.root,/^light_/),R.uplinkRing=r;for(let l=0;l<3;l++){let c=.7+l*.5,h=60+l*45,u=dr(R.hab,Math.sin(c)*h,Math.cos(c)*h,Qa()*6),d=Mi(u,["debris_a","debris_b","debris_c"][l]);R.pods.push({group:u,kind:"debris",taken:!1,loot:{scrap:2},label:"Salvage MDV debris",cols:d.cols})}let o=dr(R.hab,-420,590,.6);R.rtgSite={group:o,taken:!1,cols:Mi(o,"rtg").cols}}function $r(i,e){i.userData.hidden=!e,i.visible=e&&i.userData.near!==!1}var Mw=new C;function Pv(i){let e=i.length(),t=Math.sqrt(Math.max(0,e*e-11870*11870));for(let n of Dp){if(n.parent!==ce.world)continue;let s=Mw.copy(n.position).sub(i).length(),r=n.userData.reach||1800;n.userData.near=R.sealedInside?n===R.hab:s<Math.min(r,t+700),n.userData.hidden?n.visible=!1:n.userData.near!==n.visible&&(n.visible=n.userData.near)}}function Iv(i){if(!R.hab||!R.doors)return;let e=f.mode==="rover"?R.rover.group.position:R.playerPos||R.hab.position,t=Fs(R.hab,e,An),n=Math.hypot(t.x,t.z),s=Math.abs(t.x)<5&&t.z>0&&t.z<26,r=n<Wn+.5||s;R.habInterior&&(R.habInterior.visible=r),R.habFurnishings&&(R.habFurnishings.visible=r),R.sealedInside=f.mode==="walk"&&n<Wn-.3&&R.doors.every(a=>a.k<.01);for(let a of R.doors){let o=t.z-(a.outer?11.6:Wn),c=Math.abs(t.x)<2.6&&Math.abs(o)<3.4&&f.mode==="walk"?1:0;a.k+=Math.sign(c-a.k)*Math.min(Math.abs(c-a.k),i*2.2);let h=a.k*a.k*(3-2*a.k);a.node.position.x=a.x0+a.dx*h}}function Lv(i){let e=ce.planet,t=(n,s,r)=>e.addPad(n.x,n.y,n.z,s,r);t(i.v,46,34),t(Bt(19.13,326.79),7,10),t(Bt(-1.9,15.9),16,18);for(let n of yu)n.name!=="Pathfinder"&&t(n.v,6,9);ce.terrain.syncPads(e.pads)}function dr(i,e,t,n){let r=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position).normalize().clone(),a=new Xt;return Dp.push(a),a.position.copy(r).multiplyScalar(St(r)),$i(r,n||0,a.quaternion),a.userData.up=r.clone(),ce.world.add(a),a}function Dv(i,e,t,n,s){let r=new Xt;r.position.set(e,.06,t),(s||i).add(r);let a=ti("farm_plot");r.add(a.root);let o=a.part("soil"),l=a.part("plants"),c=a.part("plants_dead");c&&(c.visible=!1),o.visible=!1,l.visible=!1,n&&Lp(i,e,t,.85);let h=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position);return R.plots.push({group:r,soilMesh:o,plants:l,plantsDead:c,worldPos:h,state:"empty",crop:"potato",growth:0,watered:0}),R.plots[R.plots.length-1]}var Fp=.62;function Sw(i){let e=ti("rover",{face:!0});i.add(e.root);let t=["wheel_FL","wheel_ML","wheel_RL","wheel_FR","wheel_MR","wheel_RR"].map(h=>e.part(h)).filter(Boolean),n={FL:e.part("steer_FL"),FR:e.part("steer_FR"),RL:e.part("steer_RL"),RR:e.part("steer_RR")},s=new Ms(16773848,0,110,.6,.55,1.5),r=e.part("headlight_L"),a=e.part("headlight_R"),o=new C(0,1.4,2.6);r&&a&&(e.inner.updateWorldMatrix(!0,!0),o.copy(r.getWorldPosition(new C)).add(a.getWorldPosition(new C)).multiplyScalar(.5),e.inner.worldToLocal(o)),s.position.copy(o);let l=new Tt;l.position.set(o.x,o.y-1.2,o.z+16),e.inner.add(s,l),s.target=l;let c=[];e.inner.traverse(h=>{h.isMesh&&!Array.isArray(h.material)&&/^light_(white|red|amber)/.test(h.material.name)&&(h.material=h.material.clone(),h.material.userData.baseEmissive=h.material.emissiveIntensity||1,c.push(h.material))}),R.rover={group:i,wheels:t,steer:n,headlight:s,lamps:c,speed:0,model:e,cargo:e.part("cargo"),seat:e.part("seat"),dish:e.part("dish")},R.roverCollider={v:i.position.clone().normalize(),r:2.6},fr.push(R.roverCollider)}var ww={"Mars 3":"mars3","Mars 6":"mars3","Viking 1":"viking","Viking 2":"viking","Beagle 2":"beagle2",Spirit:"mer",Opportunity:"mer",Phoenix:"phoenix",Curiosity:"msl",Perseverance:"msl","Schiaparelli EDM":"schiaparelli_wreck",InSight:"insight",Zhurong:"zhurong"},Mu=new C;function Np(i,e,t,n){let r={v:new C(e,0,t).applyQuaternion(i.quaternion).add(i.position).normalize(),r:n,r0:n};return fr.push(r),r}function Su(i,e){if(i)for(let t of i)t.r=e?t.r0:.001}function Mi(i,e,t={}){let n=ti(e);t.at&&n.root.position.set(t.at[0],0,t.at[1]),t.yaw&&(n.root.rotation.y=t.yaw),i.add(n.root),n.cols=[];for(let s of Ip(n))s.node.updateWorldMatrix(!0,!1),i.worldToLocal(s.node.getWorldPosition(Mu)),n.cols.push(Np(i,Mu.x,Mu.z,s.r));return n}function Fv(){let i=ts(19.13,326.79,.7);R.pfModel=ti("pathfinder"),i.add(R.pfModel.root),R.pathfinder=i,R.pfCollider={v:i.position.clone().normalize(),r:2},fr.push(R.pfCollider);let e=ts(-1.9,15.9,0),t=ti("mav");e.add(t.root),R.mavRocket=t.part("ascent"),R.mavRocketY=R.mavRocket.position.y,R.mavNose=t.part("nose"),R.mavStrobeMats=Ds(t.part("strobe"));let n=t.part("flame"),s=new Et(new Ho(.9,.2,7,14,1,!0),new pn({color:new Ee(8,4.2,1.2),transparent:!0,opacity:.9,side:Mn,depthWrite:!1,fog:!1}));s.position.y=-3.5,(n||R.mavRocket).add(s),s.visible=!1,R.mavFlame=s,R.mav=e,e.userData.reach=9e3,fr.push({v:e.position.clone().normalize(),r:3.4});for(let a of yu){if(a.name==="Pathfinder"){R.landers.push({data:a,group:i});continue}let o=ts(a.lat,a.lon,Qa()*6);Mi(o,ww[a.name]),a.name==="Perseverance"&&Mi(o,"ingenuity",{at:[3.2,2.1],yaw:.7}),R.landers.push({data:a,group:o})}let r=[[72.77,164.58]];for(let a=0;a<11;a++)r.push([42+Zn(a,7,1)*32,Zn(a,3,9)*360]);for(let[a,o]of r){let l=ts(a,o,Zn(a,o,4)*6.28),c=Mi(l,"ice_outcrop"),h=[];for(let u=0;u<6;u++){let d=c.part("block_"+u);d&&h.push({node:d,col:Np(l,d.position.x,d.position.z,.6)})}R.iceSites.push({group:l,left:6,korolev:a>70,blocks:h})}}function _l(i,e,t){let n=Mi(i,"supply_pod"),s={group:i,kind:"pod",taken:!1,loot:e,label:t,cols:n.cols,lid:n.part("lid"),strobe:Ds(n.part("strobe"),/^light_/)};return R.pods.push(s),s}var Ni={wall:3.93,doorHalf:.75,portalOuter:.86,portalEnd:4.62,floor:.06};function ao(i,e,t=0){if(i==="greenhouse"){let r=Mu.copy(e).normalize(),a=ce.planet.addPad(r.x,r.y,r.z,5.6,5);ce.terrain.syncPads([a])}let n=ts(e,void 0,t),s={kind:i,group:n,v:n.position.clone().normalize(),yaw:t,charges:i==="cache"?3:0};if(i==="solar")Mi(n,"solar_kit");else if(i==="greenhouse"){n.position.addScaledVector(n.userData.up,-Ni.floor),Mi(n,"greenhouse");for(let[r,a]of[[-1.1,-1.2],[1.1,-1.2],[-1.1,1.2],[1.1,1.2]])Dv(n,r,a,!0)}else if(i==="beacon"){let r=Mi(n,"beacon");s.lamp=Ds(r.part("lamp"),/^light_/)}else if(i==="cache"){let r=Mi(n,"o2_cache");s.tanks=[0,1,2].map(a=>r.part("tank_"+a))}return R.builtMeshes.push(s),s}function Ml(i,e){let t=Qa()*Math.PI*2,n=40+Qa()*30,s=dr(R.hab,Math.sin(t)*n,Math.cos(t)*n,Qa()*6),r=_l(s,i,e||"Open supply pod");return we.jingle(),Ue("Supply pod down, "+Math.round(n)+"m out. NASA delivers. No tip expected.","nasa"),r}function tn(i,e,t,n,s){return(s||new C).set(e,t,n).applyQuaternion(i.quaternion).add(i.position)}function Fs(i,e,t){return t=(t||new C).copy(e).sub(i.position),t.applyQuaternion(xi.copy(i.quaternion).invert())}var Tl=[];function oo(i,e,t,n){let s=new Go(1,i);s.deleteAttribute("normal"),s.deleteAttribute("uv"),s=pv(s,1e-4);let r=s.attributes.position,a=e*9301+49297|0,o=()=>{a=a+1831565813|0;let d=Math.imul(a^a>>>15,1|a);return d=d+Math.imul(d^d>>>7,61|d)^d,((d^d>>>14)>>>0)/4294967296},l=[];for(let d=0;d<n;d++){let p=o()*1.5-.5,g=o()*Math.PI*2,_=Math.sqrt(Math.max(0,1-p*p));l.push([_*Math.cos(g),p,_*Math.sin(g),.6+o()*.3])}for(let d=0;d<r.count;d++){let p=r.getX(d),g=r.getY(d),_=r.getZ(d),v=1+Pi(p*1.3+e,g*1.3,_*1.3)*.36+Pi(p*2.9,g*2.9+e,_*2.9)*.15+Pi(p*6.3,g*6.3,_*6.3+e)*.05;p*=v,g*=v,_*=v;for(let[m,y,M,x]of l){let T=p*m+g*y+_*M-x;T>0&&(p-=m*T,g-=y*T,_-=M*T)}g*=t,g<-.2&&(g=-.2+(g+.2)*.3),r.setXYZ(d,p,g,_)}s=mv(s,.62);let c=s.attributes.position,h=s.attributes.normal,u=new Float32Array(c.count*2);for(let d=0;d<c.count;d++){let p=h.getY(d),g=c.getY(d);u[d*2]=Math.min(1,Math.max(0,(p-.25)/.6))**1.5,u[d*2+1]=.42+.58*Math.min(1,Math.max(0,(g+.18)/.34))}return s.setAttribute("aRock",new nt(u,2)),s}function Tw(i){let e=new Yn({color:16777215,roughness:.9,metalness:0}),t={uGrain:{value:lu().grain},uAlbedo:{value:i},uHere:{value:new C(0,1,0)}};return e.userData.uniforms=t,e.onBeforeCompile=n=>{Object.assign(n.uniforms,t),n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
        attribute vec2 aRock;
        varying vec2 vRockMix;
        varying vec3 vRockPos;
        varying vec3 vRockN;
        varying mat3 vRockRot;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        #ifdef USE_INSTANCING
          mat3 rockM = mat3(instanceMatrix);
        #else
          mat3 rockM = mat3(1.0);
        #endif
        vec3 rockS = vec3(length(rockM[0]), length(rockM[1]), length(rockM[2]));
        vRockPos = position * rockS;                            // the rock's own frame, in metres: the grain stays put
        vRockN = normal;
        vRockMix = aRock;
        vRockRot = mat3(viewMatrix) * mat3(modelMatrix) * mat3(rockM[0] / rockS.x, rockM[1] / rockS.y, rockM[2] / rockS.z);`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
        uniform highp sampler3D uGrain;
        uniform samplerCube uAlbedo;
        uniform vec3 uHere;
        varying vec2 vRockMix;
        varying vec3 vRockPos;
        varying vec3 vRockN;
        varying mat3 vRockRot;
        ${Jf}`).replace("#include <color_fragment>",`#include <color_fragment>
        vec4 rg1 = texture(uGrain, vRockPos * 0.55 + 0.37);
        vec4 rg2 = texture(uGrain, vRockPos * 4.1);
        vec3 ground = groundGrade(textureCube(uAlbedo, uHere).rgb);
        float gl = dot(ground, vec3(0.3, 0.55, 0.15));
        // diffuseColor carries the rock's own tone (instance colour): how dark, how grey
        vec3 stone = mix(vec3(gl), ground, 0.55) * diffuseColor.rgb;
        float dust = clamp(vRockMix.x * 1.25 + (rg1.a - 0.5) * 0.9, 0.0, 1.0);
        diffuseColor.rgb = mix(stone, ground * 0.92, dust) * vRockMix.y * (1.0 + (rg1.a - 0.5) * 0.7 + (rg2.a - 0.5) * 0.45);`).replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
        {
          vec3 on = normalize(vRockN);
          vec3 g = (rg1.rgb - 0.5) * 1.3 + (rg2.rgb - 0.5) * 0.9;
          g -= on * dot(g, on);
          normal = normalize(normal - vRockRot * g);
        }`)},e.customProgramCacheKey=()=>"rock3",e}var Sl=new ke,Up=new dt,Op=new dt,Nv=new C,kp=new C,Bp=new C,Uv=new C(0,1,0),wl=new Ee,Ov=new C,wu=class{constructor(e,t,n={}){this.terrain=t,this.density=n.density===void 0?1:n.density,this.sets=new Map,this.dirty=!0,this.anchor=new C,this.lastCam=new C(1e9,0,0);let s=Tw(n.albedoCube);this.material=s,this.shadowRange=n.shadowRange||0;let r=(a,o,l)=>{let c=new ms(a,s,o);return c.castShadow=l,c.receiveShadow=!0,c.frustumCulled=!1,c.count=0,c.instanceMatrix.setUsage(qa),e.add(c),c};this.near=[oo(2,1.7,.74,7),oo(2,5.3,.62,9)].map(a=>r(a,Math.round(60*this.density),this.shadowRange>0)),this.far=[oo(1,9.2,.6,4),oo(1,4.4,.82,5)].map(a=>r(a,Math.round(700*this.density),!1)),this.smallNear=r(oo(1,2.6,.66,4),Math.round(260*this.density),this.shadowRange>0),this.small=r(oo(0,6.1,.62,0),Math.round(3200*this.density),!1),this.smallCap=this.small.instanceMatrix.count,t.onChunk=(a,o)=>{o.rocks&&o.rocks.length&&(this.sets.set(a,{kind:a.level===t.rockLevels.big?"big":"small",data:o.rocks,origin:o.origin}),this.dirty=!0)},t.onDispose=a=>{this.sets.delete(a)&&(this.dirty=!0)}}update(e){if(this.material.userData.uniforms.uHere.value.copy(e).normalize(),!this.dirty&&e.distanceToSquared(this.lastCam)<324)return;this.dirty=!1,this.lastCam.copy(e),this.anchor.copy(e);for(let l of[...this.near,...this.far,this.smallNear,this.small])l.position.copy(this.anchor);let t=0,n=0,s=[0,0],r=[0,0];Tl.length=0;let a=this.terrain.frame;for(let[l,c]of this.sets){if(l.used<a-2)continue;let h=c.kind==="big",u=h?520:85,d=c.data,p=c.origin;if(kp.set(p[0],p[1],p[2]),!(kp.distanceTo(e)>u+l.size))for(let g=0;g<d.length;g+=8){let _=p[0]+d[g],v=p[1]+d[g+1],m=p[2]+d[g+2],y=Math.hypot(_-e.x,v-e.y,m-e.z),M=d[g+6],x=d[g+7];if(y>u||h&&M<.9&&y>260)continue;Bp.set(d[g+3],d[g+4],d[g+5]),Up.setFromUnitVectors(Uv,Bp),Op.setFromAxisAngle(Uv,x*6.283).premultiply(Up),Ov.set(Math.sin(x*40),0,Math.cos(x*40)),Op.multiply(Up.setFromAxisAngle(Ov,(x-.5)*.7)),Nv.set(M*(.75+x*7%1*.6),M*(.6+x*13%1*.7),M*(.75+x*29%1*.6)),Sl.compose(kp.set(_-this.anchor.x,v-this.anchor.y,m-this.anchor.z),Op,Nv);let T=x*3.7%1;if(wl.setRGB(.62-T*.3,.6-T*.3,.6-T*.28),h){let S=y<60&&M>.5,b=x<.5?0:1;if(S&&s[b]<this.near[b].instanceMatrix.count)this.near[b].setMatrixAt(s[b],Sl),this.near[b].setColorAt(s[b],wl),s[b]++;else{let w=x<.5?0:1,L=this.far[w];if(r[w]>=L.instanceMatrix.count)continue;L.setMatrixAt(r[w],Sl),L.setColorAt(r[w],wl),r[w]++}M>1.05&&y<140&&Tl.push({v:Bp.clone(),r:M*.62})}else{if(y<22&&n<this.smallNear.instanceMatrix.count){this.smallNear.setMatrixAt(n,Sl),this.smallNear.setColorAt(n,wl),n++;continue}if(t>=this.smallCap)continue;this.small.setMatrixAt(t,Sl),this.small.setColorAt(t,wl),t++}}}let o=(l,c)=>{l.count=c,l.instanceMatrix.needsUpdate=!0,l.instanceColor&&(l.instanceColor.needsUpdate=!0)};o(this.near[0],s[0]),o(this.near[1],s[1]),o(this.far[0],r[0]),o(this.far[1],r[1]),o(this.smallNear,n),o(this.small,t),this.counts={big:s[0]+s[1]+r[0]+r[1],near:s[0]+s[1],small:t+n,colliders:Tl.length}}};function Ew(i=64){let e=document.createElement("canvas");e.width=e.height=i;let t=e.getContext("2d"),n=t.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.35,"rgba(255,255,255,0.55)"),n.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=n,t.fillRect(0,0,i,i);let s=new Ua(e);return s.colorSpace=di,s}function Aw(i){let e=document.createElement("canvas");e.width=64,e.height=128;let t=e.getContext("2d");if(t.fillStyle="#000",t.fillRect(0,0,64,128),i==="boot"){t.fillStyle="#555",t.beginPath(),t.ellipse(32,44,19,36,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(32,104,15,19,0,0,Math.PI*2),t.fill(),t.fillStyle="#fff";for(let s=16;s<76;s+=11)t.fillRect(17,s,30,5);t.fillRect(20,94,24,6),t.fillRect(20,106,24,6)}else{let s=t.createLinearGradient(0,0,64,0);s.addColorStop(0,"#000"),s.addColorStop(.18,"#3a3a3a"),s.addColorStop(.82,"#3a3a3a"),s.addColorStop(1,"#000"),t.fillStyle=s,t.fillRect(0,0,64,128),t.lineWidth=6,t.strokeStyle="#d0d0d0";for(let r=-10;r<140;r+=32)t.beginPath(),t.moveTo(10,r+16),t.lineTo(32,r),t.lineTo(54,r+16),t.stroke()}let n=new Ua(e);return n.colorSpace=di,n.anisotropy=4,n}var Rn=new C,Ns=new dt,kv=new dt,Bv=new ke,zp=new C,zv=new C(0,1,0),qn=new C,Un=new C,Tu=class{constructor(e,t={}){this.scene=e,this.time=0,this.sprite=Ew(),this.drift=new C,this.fall=0,this._initAir(t.air===void 0?1400:t.air),this._initSheets(t.sheets===void 0?36:t.sheets),this._initPuffs(t.puffs||500),this._initMarks(t.marks||500)}_initAir(e){let t=new Float32Array(e*3),n=new Float32Array(e);for(let a=0;a<e;a++)t[a*3]=Math.random(),t[a*3+1]=Math.random(),t[a*3+2]=Math.random(),n[a]=Math.random();let s=new Ct;s.setAttribute("position",new nt(t,3)),s.setAttribute("aRnd",new nt(n,1)),this.airU={uDrift:{value:this.drift},uFall:{value:0},uCam:{value:new C},uUp:{value:new C(0,1,0)},uStorm:{value:0},uLight:{value:new Ee(1,.8,.6)},uPx:{value:600},uMap:{value:this.sprite},uAmount:{value:1}};let r=new Ut({uniforms:this.airU,transparent:!0,depthWrite:!1,fog:!1,blending:Ts,vertexShader:`
        attribute float aRnd;
        uniform float uFall, uStorm, uPx, uAmount;
        uniform vec3 uCam, uDrift, uUp;
        varying float vA;
        void main() {
          const float BOX = 70.0;
          // a box of motes that wraps around the camera: each stays put in the world as you move.
          // Each mote rides the wind at its own pace, in tenths, so the wrapped totals stay exact.
          float pace = (6.0 + floor(aRnd * 9.0)) * 0.1;
          vec3 world = position * BOX + uDrift * pace - uUp * (uFall * (pace - 0.1));
          vec3 rel = mod(world - uCam, BOX) - BOX * 0.5;
          vec4 mv = viewMatrix * vec4(rel, 0.0);
          mv.w = 1.0;
          gl_Position = projectionMatrix * mv;
          float d = length(rel);
          float size = mix(0.035, 0.22, uStorm) * (0.5 + aRnd);
          gl_PointSize = clamp(size * uPx / max(-mv.z, 0.3), 1.0, 90.0);
          float show = step(aRnd, mix(0.42, 1.0, uStorm) * uAmount);
          vA = show * smoothstep(0.6, 2.5, d) * (1.0 - smoothstep(BOX * 0.32, BOX * 0.5, d)) * mix(0.16, 0.42, uStorm);
        }`,fragmentShader:`
        uniform sampler2D uMap; uniform vec3 uLight;
        varying float vA;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).a * vA;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uLight, a);
        }`});this.air=new tr(s,r),this.air.frustumCulled=!1,this.air.renderOrder=20,this.scene.add(this.air)}_initSheets(e){let t=new Yo;t.setAttribute("position",new nt(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3)),t.setIndex([0,1,2,0,2,3]);let n=new Float32Array(e*3),s=new Float32Array(e);for(let a=0;a<e;a++)n[a*3]=Math.random(),n[a*3+1]=Math.random(),n[a*3+2]=Math.random(),s[a]=Math.random();t.setAttribute("aSeed",new ci(n,3)),t.setAttribute("aRnd",new ci(s,1)),t.instanceCount=e,this.sheetU={uDrift:{value:this.drift},uCam:{value:new C},uUp:{value:new C(0,1,0)},uCamH:{value:2},uStorm:{value:0},uLight:{value:new Ee(1,.8,.6)},uMap:{value:this.sprite}};let r=new Ut({uniforms:this.sheetU,transparent:!0,depthWrite:!1,fog:!1,blending:Ts,vertexShader:`
        attribute vec3 aSeed; attribute float aRnd;
        uniform float uStorm, uCamH;
        uniform vec3 uCam, uDrift, uUp;
        varying float vA; varying vec2 vUv;
        void main() {
          const float BOX = 70.0;
          float pace = (8.0 + floor(aRnd * 7.0)) * 0.1;
          vec3 rel = mod(aSeed * BOX + uDrift * pace - uCam, BOX) - BOX * 0.5;
          // keep the spread sideways, but press the height into the few metres above the ground
          float v = dot(rel, uUp);
          float h = v / BOX + 0.5;
          vec3 centre = rel - uUp * v + uUp * (0.4 + h * h * 9.0 - uCamH);
          float len = mix(4.5, 10.0, aRnd), tall = mix(1.0, 2.8, h);
          vec4 mv = viewMatrix * vec4(centre, 0.0);
          mv.xy += position.xy * vec2(len, tall);
          mv.w = 1.0;
          gl_Position = projectionMatrix * mv;
          vUv = position.xy * 0.5 + 0.5;
          float d = length(centre);
          vA = uStorm * uStorm * 0.20 * smoothstep(2.5, 9.0, d) * (1.0 - smoothstep(BOX * 0.30, BOX * 0.48, length(rel)))
             * smoothstep(0.0, 0.08, h) * (1.0 - smoothstep(0.8, 1.0, h));
        }`,fragmentShader:`
        uniform sampler2D uMap; uniform vec3 uLight;
        varying float vA; varying vec2 vUv;
        void main() {
          float a = texture2D(uMap, vUv).a * vA;
          if (a < 0.003) discard;
          gl_FragColor = vec4(uLight, a);
        }`});this.sheets=new Et(t,r),this.sheets.frustumCulled=!1,this.sheets.renderOrder=19,this.sheets.visible=!1,this.scene.add(this.sheets)}_initPuffs(e){this.puffN=e,this.puffI=0;let t=new Ct;this.pStart=new nt(new Float32Array(e*3),3),this.pVel=new nt(new Float32Array(e*3),3),this.pInfo=new nt(new Float32Array(e*4),4);for(let s of[this.pStart,this.pVel,this.pInfo])s.setUsage(qa);for(let s=0;s<e;s++)this.pInfo.setXYZW(s,-100,1,0,0);t.setAttribute("position",this.pStart),t.setAttribute("aVel",this.pVel),t.setAttribute("aInfo",this.pInfo),this.puffAnchor=new C,this.puffU={uTime:{value:0},uUp:{value:new C(0,1,0)},uLight:{value:new Ee(1,.8,.6)},uPx:{value:600},uMap:{value:this.sprite},fogColor:{value:new Ee},fogDensity:{value:0},fogNear:{value:1},fogFar:{value:2e3}};let n=new Ut({uniforms:this.puffU,transparent:!0,depthWrite:!1,fog:!0,vertexShader:`
        #include <fog_pars_vertex>
        attribute vec3 aVel; attribute vec4 aInfo;
        uniform float uTime, uPx; uniform vec3 uUp;
        varying float vA; varying float vTone;
        void main() {
          float age = uTime - aInfo.x;
          float k = clamp(age / aInfo.y, 0.0, 1.0);
          // fast at first, then hanging in the thin air
          float travel = (1.0 - exp(-age * 2.2)) / 2.2;
          vec3 p = position + aVel * travel - uUp * (0.35 * age * age * 0.5);
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(aInfo.z * (0.6 + 1.9 * k) * uPx / max(-mvPosition.z, 0.3), 1.0, 220.0);
          vA = (age < 0.0 || k >= 1.0) ? 0.0 : (1.0 - k) * (1.0 - k) * smoothstep(0.0, 0.06, k) * 0.34;
          vTone = aInfo.w;
          #include <fog_vertex>
        }`,fragmentShader:`
        #include <fog_pars_fragment>
        uniform sampler2D uMap; uniform vec3 uLight;
        varying float vA; varying float vTone;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).a * vA;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uLight * mix(vec3(0.62, 0.34, 0.20), vec3(1.0, 0.9, 0.8), vTone), a);
          #include <fog_fragment>
        }`});this.puffs=new tr(t,n),this.puffs.frustumCulled=!1,this.puffs.renderOrder=21,this.scene.add(this.puffs)}puff(e,t={}){let n=t.count||6,s=t.speed===void 0?1.2:t.speed,r=t.up===void 0?.8:t.up,a=t.spread===void 0?.25:t.spread,o=t.size||.5,l=t.life||1.6;if(e.distanceToSquared(this.puffAnchor)>400*400){for(let c=0;c<this.puffN;c++)this.pInfo.setX(c,-100);this.puffAnchor.copy(e),this.puffs.position.copy(e)}Un.copy(e).normalize(),qn.set(-Un.z,0,Un.x).normalize(),Rn.crossVectors(Un,qn);for(let c=0;c<n;c++){let h=this.puffI;this.puffI=(this.puffI+1)%this.puffN;let u=Math.random()*Math.PI*2,d=Math.sqrt(Math.random()),p=Math.cos(u)*d*a,g=Math.sin(u)*d*a;this.pStart.setXYZ(h,e.x-this.puffAnchor.x+qn.x*p+Rn.x*g,e.y-this.puffAnchor.y+qn.y*p+Rn.y*g,e.z-this.puffAnchor.z+qn.z*p+Rn.z*g);let _=s*(.4+Math.random()*.9),v=r*(.5+Math.random()),m=qn.x*Math.cos(u)*_+Rn.x*Math.sin(u)*_+Un.x*v,y=qn.y*Math.cos(u)*_+Rn.y*Math.sin(u)*_+Un.y*v,M=qn.z*Math.cos(u)*_+Rn.z*Math.sin(u)*_+Un.z*v;t.dir&&(m+=t.dir.x,y+=t.dir.y,M+=t.dir.z),this.pVel.setXYZ(h,m,y,M),this.pInfo.setXYZW(h,this.time,l*(.7+Math.random()*.6),o*(.6+Math.random()*.8),t.tone||0)}this.pStart.needsUpdate=!0,this.pVel.needsUpdate=!0,this.pInfo.needsUpdate=!0}_initMarks(e){this.markN=e;let t=(n,s,r)=>{let a=new Or(s,r);a.rotateX(-Math.PI/2);let o=new pn({color:1838342,alphaMap:Aw(n),transparent:!0,opacity:.5,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:!0}),l=new ms(a,o,e);return l.count=0,l.frustumCulled=!1,l.renderOrder=2,l.instanceMatrix.setUsage(qa),this.scene.add(l),{mesh:l,i:0,used:0,world:new Float64Array(e*3),quat:new Float32Array(e*4),anchor:new C}};this.boots=t("boot",.16,.34),this.tyres=t("tyre",.46,.9)}mark(e,t,n){let s=e==="boot"?this.boots:this.tyres,r=s.i;s.i=(s.i+1)%this.markN,s.used=Math.min(this.markN,s.used+1),Un.copy(t).normalize(),Ns.setFromUnitVectors(zv,Un),qn.copy(n).addScaledVector(Un,-n.dot(Un)).normalize(),Rn.set(0,0,-1).applyQuaternion(Ns);let a=Math.atan2(Rn.clone().cross(qn).dot(Un),Rn.dot(qn));kv.setFromAxisAngle(zv,a),Ns.multiply(kv),s.world[r*3]=t.x,s.world[r*3+1]=t.y,s.world[r*3+2]=t.z,s.quat[r*4]=Ns.x,s.quat[r*4+1]=Ns.y,s.quat[r*4+2]=Ns.z,s.quat[r*4+3]=Ns.w,s.used===1||Rn.set(t.x,t.y,t.z).distanceToSquared(s.anchor)>300*300?this._reanchor(s,t):this._write(s,r),s.mesh.count=s.used,s.mesh.instanceMatrix.needsUpdate=!0}_write(e,t){Rn.set(e.world[t*3]-e.anchor.x,e.world[t*3+1]-e.anchor.y,e.world[t*3+2]-e.anchor.z),Un.set(e.world[t*3],e.world[t*3+1],e.world[t*3+2]).normalize(),Rn.addScaledVector(Un,.025),Ns.set(e.quat[t*4],e.quat[t*4+1],e.quat[t*4+2],e.quat[t*4+3]),Bv.compose(Rn,Ns,zp.set(1,1,1)),e.mesh.setMatrixAt(t,Bv)}_reanchor(e,t){e.anchor.copy(t),e.mesh.position.copy(t);for(let n=0;n<e.used;n++)this._write(e,n)}update(e,t,n){this.time+=e;let s=Un.copy(t.position).normalize();qn.set(-s.z,0,s.x).normalize(),Rn.crossVectors(s,qn);let r=Math.sin(this.time*.013)*.6,a=(n.pixelHeight||720)/(2*Math.tan(t.fov*Math.PI/360)),o=Math.min(1.6,.25+n.sunIntensity*.32),l=this.airU,c=700;zp.copy(qn).multiplyScalar(Math.cos(r)).addScaledVector(Rn,Math.sin(r)),this.drift.addScaledVector(zp,(1.5+24.5*n.storm)*e),this.drift.set((this.drift.x%c+c)%c,(this.drift.y%c+c)%c,(this.drift.z%c+c)%c),this.fall=(this.fall+(.15+n.storm*1.2)*e)%c,l.uFall.value=this.fall,l.uCam.value.copy(t.position),l.uUp.value.copy(s),l.uStorm.value=n.storm,l.uPx.value=a,l.uAmount.value=n.inside?0:Math.max(0,1-(t.position.length()-12e3)/900),l.uLight.value.setRGB(.86*o+n.ambient.r*.4,.62*o+n.ambient.g*.4,.44*o+n.ambient.b*.4),this.air.visible=l.uAmount.value>.01;let h=this.sheetU;this.sheets.visible=this.air.visible&&n.storm>.08,h.uCam.value.copy(t.position),h.uUp.value.copy(s),h.uStorm.value=n.storm,h.uCamH.value=Math.min(40,Math.max(.5,n.camHeight===void 0?2:n.camHeight)),h.uLight.value.copy(l.uLight.value);let u=this.puffU;u.uTime.value=this.time,u.uUp.value.copy(s),u.uPx.value=a,u.uLight.value.setRGB(o*.75+n.ambient.r*.8,o*.72+n.ambient.g*.8,o*.7+n.ambient.b*.8)}};var El=new Map;function Eu(i,e){return El.has(i)||El.set(i,[]),El.get(i).push(e),()=>Rw(i,e)}function Rw(i,e){let t=El.get(i);if(t){let n=t.indexOf(e);n>=0&&t.splice(n,1)}}function Us(i,e){let t=El.get(i);if(t)for(let n of t.slice())n(e)}var pr={scrap:"Scrap Metal",circuit:"Circuit Board",regolith:"Regolith",ice:"Ice Chunk",candle:"O2 Candle",kitSolar:"Solar Panel Kit",kitGreenhouse:"Greenhouse Kit",kitBeacon:"Nav Beacon Kit",kitCache:"O2 Cache Kit"},Hp=[{id:"candle",name:"O2 Candle",desc:"+40 suit O2 in the field (press X)",cost:{scrap:2,regolith:1},gives:{candle:1}},{id:"meltIce",name:"Melt Ice",desc:"+10L water (uses 2 PWR)",cost:{ice:1},run:()=>f.power<2?"Not enough hab power":(f.power-=2,f.water=_e(f.water+Le.iceWater,0,Le.waterMax),!0)},{id:"kitSolar",name:"Portable Solar Panel",desc:"Deployable: recharges the rover nearby; boosts hab power if placed at home",cost:{scrap:4,circuit:1},gives:{kitSolar:1}},{id:"kitGreenhouse",name:"Greenhouse Dome",desc:"Deployable: 4 farm plots, anywhere on Mars",cost:{scrap:8,circuit:2},gives:{kitGreenhouse:1}},{id:"kitBeacon",name:"Nav Beacon",desc:"Deployable: permanent map + compass marker",cost:{scrap:2,circuit:1},gives:{kitBeacon:1}},{id:"kitCache",name:"O2 Cache",desc:"Deployable: 3 suit-O2 refills in the field",cost:{scrap:3,candle:1},gives:{kitCache:1}}],Au=[{id:"drive1",name:"Rover Drivetrain I",desc:"Top speed 35 \u2192 45 m/s",cost:{scrap:6,circuit:1}},{id:"drive2",name:"Rover Drivetrain II",desc:"Top speed 45 \u2192 55 m/s",cost:{scrap:10,circuit:2},bp:"drive2",needs:"drive1"},{id:"roverBattery",name:"Rover Battery Bank",desc:"Rover power 100 \u2192 160, night drain \u221225%",cost:{scrap:8,circuit:1}},{id:"tank1",name:"Suit Tank I",desc:"Suit O2 100 \u2192 150",cost:{scrap:4}},{id:"tank2",name:"Suit Tank II",desc:"Suit O2 150 \u2192 200",cost:{scrap:8,circuit:1},bp:"tank2",needs:"tank1"},{id:"recycler",name:"Suit CO2 Recycler",desc:"EVA O2 drain \u221225%",cost:{scrap:6,circuit:2},bp:"recycler"},{id:"insulation",name:"Hab Insulation",desc:"Hab base power draw \u221230%",cost:{scrap:6}},{id:"wiper",name:"Panel Auto-Wiper",desc:"Panel dust accrual \u221270%",cost:{scrap:5,circuit:1}},{id:"drill",name:"Ice Drill",desc:"Unlocks mining at ice deposits",cost:{scrap:4,circuit:1},bp:"drill"},{id:"rtg",name:"Socket the RTG",desc:"Cold stops draining power; +6 PWR/sol at night",cost:{},needsRtg:!0}];function Al(i){for(let e in i)if((f.inv[e]||0)<i[e])return!1;return!0}function Ru(i){for(let e in i)f.inv[e]-=i[e]}function Gp(i){let e=Object.keys(i).map(t=>`${i[t]} ${pr[t]||t}`);return e.length?e.join(" + "):"free"}function Vp(i){let e=[];for(let t in i)t==="rations"?(f.food+=i[t],e.push(`${i[t]} rations`)):t==="water"?(f.water=_e(f.water+i[t],0,Le.waterMax),e.push(`${i[t]}L water`)):t==="hydrazine"?(f.hydrazine+=i[t],e.push(`${i[t]} hydrazine`)):(f.inv[t]=(f.inv[t]||0)+i[t],e.push(`${i[t]} ${pr[t]||t}`));return we.pickup(),e.join(", ")}function Cu(){return R.hab&&st(k.pos,R.hab.position)<120}window.addEventListener("keydown",i=>{i.key.toLowerCase()!=="x"||!f.started||f.uiOpen||Cn()||f.over||(f.inv.candle||0)>0&&f.suit<en()-5&&(f.inv.candle--,f.suit=_e(f.suit+40,0,en()),we.ok(),Ue("Cracked an O2 candle. Chemistry: still my favorite roommate."))});var Pu=[];function Pt(i){Pu.push(i),i.priority===void 0&&(i.priority=0)}var Ui={active:null},Wp=null;function Hv(i){if(Ui.active=null,f.uiOpen||Cn()||f.over||f.mode==="cutscene"){Q.prompt.style.display="none";return}let e=null,t=1e9,n=1e9,s=f.mode==="rover"?R.rover.group.position:k.pos;for(let a of Pu){if(a.mode&&a.mode!==f.mode||a.visible&&!a.visible())continue;let o=a.pos();if(!o)continue;let l=st(s,o);l>a.r||(a.priority<n||a.priority===n&&l<t)&&(n=a.priority,t=l,e=a)}if(!e){Q.prompt.style.display="none",Q.promptSub.textContent="",f.holdT=0,Wp=null;return}Ui.active=e,e!==Wp&&(f.holdT=0,Wp=e);let r=e.enabled?e.enabled():!0;if(Q.prompt.style.display="block",Q.promptSub.textContent=e.sub?e.sub():"",r!==!0){Q.promptText.innerHTML=`<span style="opacity:.75">${typeof r=="string"?r:e.label()}</span>`,Q.hold.style.display="none",f.holdT=0;return}Q.promptText.innerHTML=`<span class="key">E</span>${e.hold>.7?"HOLD \u2014 ":""}${e.label()}`,Ge.eHeld?(f.holdT+=i,Q.hold.style.display="block",Q.holdFill.style.width=_e(f.holdT/e.hold*100,0,100)+"%",f.holdT>=e.hold&&(f.holdT=0,Ge.eHeld=!1,Q.hold.style.display="none",e.use())):(f.holdT=0,Q.hold.style.display="none")}var Cw=new Ee(9067060),Pw=new dt().setFromAxisAngle(new C(1,0,0),-1.9);function qp(i){if(i.kind!=="pod"){$r(i.group,!i.taken),Su(i.cols,!i.taken);return}i.lid&&(i.lidRest||(i.lidRest=i.lid.quaternion.clone()),i.lid.quaternion.copy(i.lidRest),i.taken&&i.lid.quaternion.multiply(Pw)),i.taken&&es(i.strobe,0)}function Xp(i){i.blocks.forEach((e,t)=>{let n=t<i.left;e.node.visible=n,e.col.r=n?e.col.r0:.001})}function Pn(){for(let t of R.plots)Zr(t);for(let t of R.panels){let n=_e(t.dust,0,1);for(let s of t.cells){s.userData.clean||(s.userData.clean={color:s.color.clone(),rough:s.roughness,metal:s.metalness});let r=s.userData.clean;s.color.copy(r.color).lerp(Cw,n*.9),s.roughness=r.rough+(.95-r.rough)*n,s.metalness=r.metal*(1-n)}}for(let t of R.soilPiles)$r(t.group,t.left>0),Su(t.cols,t.left>0),t.mesh.scale.setScalar(.55+.225*t.left);R.breachHole&&(R.breachHole.visible=f.breach.active),R.breachPatch&&(R.breachPatch.visible=f.breach.done&&!f.breach.active);let i=f.power>.5;es(R.commsMats,f.pf.connected&&i?1:.04),es(R.oxyMats,i?1:.05);for(let t of R.habLights)t.intensity=i?t.userData.on:t.userData.on*.05;for(let t of R.pods)qp(t);R.rtgSite&&($r(R.rtgSite.group,!R.rtgSite.taken),Su(R.rtgSite.cols,!R.rtgSite.taken));for(let t of R.iceSites)Xp(t);for(let t of R.builtMeshes)t.tanks&&t.tanks.forEach((n,s)=>{n&&(n.visible=s<t.charges)});let e=R.pathfinder;if(f.pf.connected)e.parent!==ce.world&&ce.world.add(e),tn(R.hab,13.5,0,5.5,e.position),e.position.normalize().multiplyScalar(St(e.position)),$i(Pe.copy(e.position).normalize(),.3,e.quaternion),e.scale.set(1,1,1),R.pfCollider.r=.001,$r(R.uplinkRing,!1);else if(f.pf.loaded){let t=R.rover.cargo||R.rover.group;if(e.parent!==t){t.add(e),R.rover.cargo?e.position.set(0,0,0):e.position.set(0,2.15,-1.1),e.quaternion.set(0,0,0,1);let n=R.pfModel?.5:.8;e.scale.set(n,n,n)}R.pfCollider.r=.001,$r(R.uplinkRing,!0)}else{e.parent!==ce.world&&ce.world.add(e);let t=Bt(19.13,326.79);e.position.copy(t).multiplyScalar(St(t)),$i(t,.7,e.quaternion),e.scale.set(1,1,1),R.pfCollider.r=2.2,$r(R.uplinkRing,!1)}}var mt={q:new dt,speed:0,steer:0,camPos:new C,camInit:!1,camYaw:0,camPitch:0,camIdle:9,pitch:0,roll:0,pitchV:0,rollV:0,heave:0,heaveV:0,slope:0,slip:0,throttle:0},jp=new C,co=new C,Rl=new C,mr=new C,Kp=new C,Iw=new C(0,0,1);function Cl(i,e){$i(Pe.copy(i).normalize(),e||0,mt.q),mt.speed=0,mt.steer=0,mt.pitch=0,mt.roll=0,mt.pitchV=0,mt.rollV=0,mt.heave=0,mt.heaveV=0,Iu(0)}function lo(i){return i.set(0,1,0).applyQuaternion(mt.q)}function Iu(i){let e=mt,t=R.rover.group;lo(mr);let n=St(mr);co.set(0,0,-1).applyQuaternion(e.q),Rl.set(1,0,0).applyQuaternion(e.q),t.position.copy(mr).multiplyScalar(n);let s=St(An.copy(t.position).addScaledVector(co,1.9)),r=St(An.copy(t.position).addScaledVector(co,-1.9)),a=St(An.copy(t.position).addScaledVector(Rl,1.25)),o=St(An.copy(t.position).addScaledVector(Rl,-1.25)),l=Math.atan2(s-r,3.8),c=Math.atan2(o-a,2.5),h=(s+r+a+o)/4-n;i<=0?(e.pitch=l,e.roll=c,e.heave=h,e.pitchV=e.rollV=e.heaveV=0):(e.pitchV+=((l-e.pitch)*110-e.pitchV*15)*i,e.pitch+=e.pitchV*i,e.rollV+=((c-e.roll)*110-e.rollV*15)*i,e.roll+=e.rollV*i,e.heaveV+=((h-e.heave)*160-e.heaveV*18)*i,e.heave+=e.heaveV*i,e.pitch=_e(e.pitch,-.9,.9),e.roll=_e(e.roll,-.8,.8),e.heave=_e(e.heave,-.6,.6)),t.position.addScaledVector(mr,e.heave),t.quaternion.copy(e.q).multiply(Ps.setFromAxisAngle(vl,e.pitch)).multiply(xi.setFromAxisAngle(Iw,e.roll)),R.roverCollider.v.copy(mr);let u=R.rover;if(u.wheels.length===6){u.wheelRest||(u.wheelRest=u.wheels.map(d=>({y:d.position.y,pos:d.getWorldPosition(new C).sub(t.position).applyQuaternion(xi.copy(t.quaternion).invert())}))),t.updateMatrixWorld(!0);for(let d=0;d<6;d++){let p=u.wheels[d],g=u.wheelRest[d];Kp.copy(g.pos).applyQuaternion(t.quaternion).add(t.position);let _=St(Kp),v=Kp.length()-_,m=_e(Fp-v,-.22,.28);p.userData.travel=it(p.userData.travel||0,m,i>0?Jt(.04,i):1),p.position.y=g.y+p.userData.travel}}}function Gv(){f.mode="rover",mt.camInit=!1,mt.camYaw=0,mt.camPitch=0,Ge.yaw=0,Ge.pitch=0,we.click(),Us("rover-enter",{})}function Pl(){f.mode="walk",mt.speed=0,k.q.copy(mt.q),Qr(k.q,1,0,3.4,12e3),Lu(k.q,.42),k.alt=0,k.vy=0,k.vx=0,k.vz=0,k.face=0,k.onGround=!0,ns(),we.click(),Us("rover-exit",{})}function Vv(i){let e=mt,t=Ge.keys,n=Ge.touch,s=(t.w||t.arrowup?1:0)-(t.s||t.arrowdown?1:0);Math.abs(n.joyY)>.2&&(s=_e(-n.joyY*1.2,-1,1));let r=(t.a||t.arrowleft?1:0)-(t.d||t.arrowright?1:0);Math.abs(n.joyX)>.15&&(r=_e(-n.joyX*1.2,-1,1)),e.throttle=s;let o=f.roverPower<=.5?5:Zf();lo(mr),co.set(0,0,-1).applyQuaternion(e.q),e.slope=pu(R.rover.group.position,3.2,jp);let l=-jp.dot(co)*e.slope,c=Le.gravity,h=Math.sign(e.speed)||Math.sign(s)||1,u=0;s>0?u+=11*s*_e(1-e.speed/o,0,1)*(e.speed<0?1.8:1):s<0&&(u+=e.speed>.5?-17:-8*_e(1+e.speed/9,0,1)),u-=c*l/Math.sqrt(1+l*l),u-=h*(.35+Math.abs(e.speed)*.045),s===0&&Math.abs(e.speed)<3&&(u-=e.speed*2.2),e.speed+=u*i;let d=_e(1.25-l*1.55,0,1);l>.2&&e.speed>o*d&&(e.speed=it(e.speed,o*d,Jt(.25,i))),e.speed=_e(e.speed,-9,o*1.15),Math.abs(e.speed)<.03&&s===0&&(e.speed=0);let p=it(.55,.16,_e(Math.abs(e.speed)/40,0,1));e.steer=it(e.steer,r*p,Jt(r?.12:.08,i)),Math.abs(e.speed)>.05&&Il(e.q,e.speed*Math.tan(e.steer)/3.8*i),Rl.set(1,0,0).applyQuaternion(e.q);let g=jp.dot(Rl)*e.slope;e.slip=Math.abs(g)>.55?Math.sign(g)*(Math.abs(g)-.55)*9:0;let _=e.speed*i;Math.abs(_)>1e-5&&(Qr(e.q,0,-Math.sign(_),Math.abs(_),12e3),f.stats.driven+=Math.abs(_)),e.slip&&Qr(e.q,Math.sign(e.slip),0,Math.abs(e.slip)*i,12e3),Lu(e.q,2)&&(Math.abs(e.speed)>6&&(f.shake=Math.max(f.shake,.35),Us("rover-bump",{speed:Math.abs(e.speed)})),e.speed*=.35),e.q.normalize(),Iu(i),k.q.copy(e.q),k.alt=0,k.vy=0,ns();let v=lo(Pe).dot(ce.engine.sunDir),m=v<.05;if(Math.abs(e.speed)>.5){let L=Le.roverDrainPerMin/60*(.5+Math.abs(e.speed)/Zf())*(1+Math.max(0,l)*1.5);m&&(L*=f.upgrades.roverBattery?1.5:2),f.roverPower=_e(f.roverPower-L*i,0,cr())}else m||(f.roverPower=_e(f.roverPower+2/60*v*i,0,cr()));let y=R.rover,M=e.speed*i/Fp;for(let L of y.wheels)L.rotation.x+=M;y.steer.FL&&(y.steer.FL.rotation.y=e.steer,y.steer.FR.rotation.y=e.steer),y.steer.RL&&(y.steer.RL.rotation.y=-e.steer*.45,y.steer.RR.rotation.y=-e.steer*.45);let x=m||f.storm.i>.5;y.headlight.intensity=it(y.headlight.intensity,x?320:0,Jt(.15,i));for(let L of y.lamps)L.emissiveIntensity=L.userData.baseEmissive*(x?1.6:.12);y.dish&&(y.dish.rotation.y+=i*.15),(Ge.yaw||Ge.pitch)&&(e.camYaw+=Ge.yaw,e.camPitch=_e(e.camPitch+Ge.pitch*(Ge.invertY?-1:1),-.5,.9),e.camIdle=0),Ge.yaw=0,Ge.pitch=0,e.camIdle+=i,e.camIdle>2.2&&(e.camYaw=it(e.camYaw,0,Jt(.5,i)),e.camPitch=it(e.camPitch,0,Jt(.5,i))),lo(mr),xi.copy(e.q).multiply(Ps.setFromAxisAngle(Ce.set(0,1,0),e.camYaw+e.steer*.35));let T=9.8+Math.abs(e.speed)*.07,S=4.3+e.camPitch*5;We.set(0,0,1).applyQuaternion(xi),An.copy(R.rover.group.position).addScaledVector(We,T*Math.cos(e.camPitch*.6)).addScaledVector(mr,S),e.camInit||(e.camPos.copy(An),e.camInit=!0),e.camPos.lerp(An,Jt(.12,i));let b=St(e.camPos)+1;e.camPos.length()<b&&e.camPos.normalize().multiplyScalar(b);let w=ce.engine.camera;w.position.copy(e.camPos),f.shake>0&&(f.shake=Math.max(0,f.shake-i*1.6),Ge.reducedMotion||w.position.addScaledVector(Pe.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.4)),Os(Ce.copy(R.rover.group.position).addScaledVector(lo(Pe),1.9).addScaledVector(co.set(0,0,-1).applyQuaternion(e.q),2.5+Math.abs(e.speed)*.1),lo(Pe)),w.fov=it(w.fov,ce.engine.baseFov+4+Math.abs(e.speed)*.22,Jt(.3,i)),w.updateProjectionMatrix(),f.inside=!1}function Du(){return{v:Wv,diff:f.diff,spawn:{lat:R.spawn.lat,lon:R.spawn.lon},sol:f.sol,tod:f.tod,o2:f.o2,water:f.water,food:f.food,potatoes:f.potatoes,power:f.power,health:Math.max(f.health,50),suit:en(),roverPower:f.roverPower,roverO2:f.roverO2,hydrazine:f.hydrazine,inv:{...f.inv},upgrades:{...f.upgrades},blueprints:{...f.blueprints},quests:{...f.quests},salvaged:{...f.salvaged},discovered:{...f.discovered},achieved:{...f.achieved},checkedSystems:{...f.checkedSystems},flags:{...f.flags},stats:{...f.stats},breach:{...f.breach},pf:{...f.pf},stormCells:f.storm.cells.map(i=>({...i})),plots:R.plots.map(i=>({state:i.state,growth:i.growth,watered:i.watered})),panels:R.panels.map(i=>i.dust),piles:R.soilPiles.map(i=>i.left),pods:R.pods.map(i=>i.taken),podLoot:R.pods.map(i=>({loot:i.loot,label:i.label,blueprint:i.blueprint||null,ll:Qn(Pe.copy(i.group.position).normalize())})),ice:R.iceSites.map(i=>i.left),rtgTaken:R.rtgSite?R.rtgSite.taken:!1,built:R.builtMeshes.map(i=>({kind:i.kind,charges:i.charges,yaw:i.yaw||0,ll:Qn(Pe.copy(i.group.position).normalize())})),playerQ:k.q.toArray(),roverQ:mt.q.toArray()}}function Ll(i){Object.assign(f,{sol:i.sol,tod:i.tod,o2:i.o2,water:i.water,food:i.food,potatoes:i.potatoes,power:i.power,health:i.health,suit:i.suit,roverPower:i.roverPower,roverO2:i.roverO2,hydrazine:i.hydrazine}),f.inv={...i.inv},f.upgrades={...i.upgrades},f.blueprints={...i.blueprints},f.quests={...i.quests},f.salvaged={...i.salvaged},f.discovered={...i.discovered},f.achieved={...i.achieved},f.checkedSystems={...i.checkedSystems},f.flags={...i.flags},f.stats={...i.stats},f.breach={...i.breach},f.pf={...i.pf},f.storm.cells=i.stormCells.map(e=>({...e})),f.storm.i=0;for(let e=R.builtMeshes.length;e<(i.built||[]).length;e++){let t=i.built[e],n=ao(t.kind,Bt(t.ll.lat,t.ll.lon),t.yaw||0);n.charges=t.charges}i.plots.forEach((e,t)=>{R.plots[t]&&Object.assign(R.plots[t],e)}),i.panels.forEach((e,t)=>{R.panels[t]&&(R.panels[t].dust=e)}),i.piles.forEach((e,t)=>{R.soilPiles[t]&&(R.soilPiles[t].left=e)});for(let e=R.pods.length;e<(i.podLoot||[]).length;e++){let t=i.podLoot[e],n=_l(ts(t.ll.lat,t.ll.lon,e*2.1),t.loot,t.label);t.blueprint&&(n.blueprint=t.blueprint)}i.pods.forEach((e,t)=>{R.pods[t]&&(R.pods[t].taken=e)}),i.ice.forEach((e,t)=>{R.iceSites[t]&&(R.iceSites[t].left=e)}),R.rtgSite&&(R.rtgSite.taken=i.rtgTaken);for(let e=0;e<Math.min(R.builtMeshes.length,i.built.length);e++)R.builtMeshes[e].charges=i.built[e].charges;k.q.fromArray(i.playerQ),k.alt=0,k.vy=0,mt.q.fromArray(i.roverQ),mt.speed=0,f.over=!1,f.dead=null,f.sleeping=!1,f.mode="walk",f.uiOpen=!1,we.alarm(!1),we.disco(!1),f.disco=!1,Q.vign.style.opacity=0,ns(),Iu(0),Pn(),Yr()}var ea={checkpoint:null};function is(){f.over||(ea.checkpoint=Du())}function Fu(){if(!ea.checkpoint){try{location.reload()}catch{}return}Ll(JSON.parse(JSON.stringify(ea.checkpoint))),Ue(`Woke at dawn, Sol ${f.sol}. Bad dream. Probably prophetic. Let's not test it.`)}var Nu="stranded2-save";function ks(){if(!(f.over||!f.started))try{localStorage.setItem(Nu,JSON.stringify(Du()))}catch{}}var Wv=3;function Lw(i){return!i||typeof i!="object"||!i.spawn||!i.playerQ?null:(i.v===2&&(i={...i,v:3,migrated:["terrain"]}),i.v===Wv?i:null)}function Yp(){try{let i=localStorage.getItem(Nu);return i?Lw(JSON.parse(i)):null}catch{return null}}function qv(){try{return!!localStorage.getItem(Nu)&&!Yp()}catch{return!1}}function ho(){try{localStorage.removeItem(Nu)}catch{}}var Dw=[{id:"reach",text:()=>"Suit breach \u2014 get to the Hab",shown:()=>!0,done:()=>f.flags.suitSealed},{id:"systems",text:()=>`Inspect the oxygenator & reclaimer (${Object.keys(f.checkedSystems).length}/2)`,shown:()=>f.flags.suitSealed,done:()=>Object.keys(f.checkedSystems).length>=2},{id:"math",text:()=>"Run the numbers at the comms desk",shown:()=>Object.keys(f.checkedSystems).length>=2,done:()=>f.flags.didMath},{id:"panels",text:()=>`Wipe down solar panels (${Math.min(f.stats.panels,3)}/3)`,shown:()=>f.flags.suitSealed,done:()=>f.stats.panels>=3},{id:"farm",text:()=>`Start the farm \u2014 plant 3 beds (${Math.min(Fl(),3)}/3)`,shown:()=>f.flags.didMath,done:()=>Fl()>=3||f.stats.potatoes>0},{id:"hydra",text:()=>"Make water: burn hydrazine (carefully)",shown:()=>f.flags.didMath,done:()=>f.stats.booms>=1},{id:"pf",text:()=>f.pf.loaded?"Bring Pathfinder to the uplink ring":`Recover Pathfinder \u2014 Ares Vallis, ${vi(st(k.pos,R.pathfinder.position))}`,shown:()=>f.flags.pfRevealed,done:()=>f.pf.connected},{id:"harvest",text:()=>`Harvest potatoes (${f.stats.potatoes} banked)`,shown:()=>Fl()>0,done:()=>f.stats.potatoes>=4},{id:"breach",text:()=>"SEAL THE BREACH",shown:()=>f.breach.active,done:()=>!f.breach.active,urgent:!0},{id:"survive",text:()=>`Survive to Sol ${f.rescueSol} (Sol ${f.sol})`,shown:()=>f.pf.connected,done:()=>f.sol>=f.rescueSol},{id:"mav",text:()=>`Get to the MAV \u2014 Schiaparelli, ${vi(st(k.pos,R.mav.position))}`,shown:()=>f.flags.mavRevealed,done:()=>f.won}],Xv=new Set,jv=0;function Yv(){if(Nn()-jv<.3)return;jv=Nn();let i='<div class="ttl">MISSION</div>',e=0;for(let n of Dw){if(!n.shown())continue;let s=n.done();if(s&&!Xv.has(n.id)&&(Xv.add(n.id),n.id!=="reach"&&we.jingle()),!(s&&n.id!=="mav")){if(e>=4)break;i+=`<div class="mg-obj${s?" done":""}"${n.urgent?' style="color:#ff6f5f"':""}>\u25B8 ${n.text()}</div>`,e++}}let t=na.filter(n=>f.quests[n.id]==="active"&&Bs(n)).map(n=>({q:n,d:st(k.pos,Bs(n))})).sort((n,s)=>n.d-s.d).slice(0,2);for(let{q:n,d:s}of t){if(e>=6)break;i+=`<div class="mg-obj quest">\u25B8 ${n.name} \u2014 ${vi(s)}</div>`,e++}Q.objectives.innerHTML=i}var Dl={},Kv=0;function Jp(i,e,t){if(Pe.copy(i).normalize(),gi(Pe,bi,Zi),We.copy(e).normalize().sub(Pe.clone().multiplyScalar(Pe.dot(We.copy(e).normalize()))),We.copy(e).normalize(),Ce.copy(We).sub(Pe.clone().multiplyScalar(Pe.dot(We))),Ce.lengthSq()<1e-10)return 0;let n=Ce.dot(bi),s=Ce.dot(Zi),r=Math.atan2(n,s);We.set(0,0,-1).applyQuaternion(t),Ce.copy(We).sub(Pe.clone().multiplyScalar(Pe.dot(We)));let a=Ce.dot(bi),o=Ce.dot(Zi),l=Math.atan2(a,o),c=r-l;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;return c}function Jv(){if(Nn()-Kv<.12)return;Kv=Nn();let i=f.mode==="rover"?R.rover.group.position:k.pos,e=f.mode==="rover"?mt.q:k.q,t=[];t.push(["hab","\u2302 HAB",R.hab.position]),f.flags.coldOpen||t.push(["rover","\u25A3 ROVER",R.rover.group.position]),f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected&&t.push(["pf","\u25BC PATHFINDER",R.pathfinder.position]),f.pf.loaded&&!f.pf.connected&&t.push(["up","\u25BC UPLINK",R.uplink.position]),f.flags.mavRevealed&&!f.won&&t.push(["mav","\u25B2 MAV",R.mav.position]),f.breach.active&&t.push(["br","\u26A0 BREACH",tn(R.hab,0,0,-Wn+1,We).clone()]);let n=0;for(let a of R.builtMeshes)a.kind==="beacon"&&t.push(["bc"+n++,"\u25C6 BEACON",a.group.position]);let s=na.filter(a=>f.quests[a.id]==="active"&&Bs(a)).map(a=>({q:a,d:st(i,Bs(a))})).sort((a,o)=>a.d-o.d).slice(0,2);for(let{q:a}of s)t.push(["q"+a.id,"\u2605 "+a.target.toUpperCase(),Bs(a)]);for(let a of R.pods)!a.taken&&st(i,a.group.position)<8e3&&t.push(["pod"+R.pods.indexOf(a),"\u25BD CACHE",a.group.position]);let r=new Set;for(let[a,o,l]of t){r.add(a);let c=Dl[a];c||(c=vt("div",null,"mg-cmark",Q.compass),Dl[a]=c);let h=st(i,l);if(h<6){c.style.display="none";continue}let u=Jp(i,l,e),d=1.15,p=_e(u/d,-1,1)*.5+.5;c.style.display="block",c.style.left=p*100+"%",c.style.opacity=Math.abs(u)>d?.35:.95,c.innerHTML=`<div class="ic">${o.split(" ")[0]}</div>${o.split(" ").slice(1).join(" ")}<br>${vi(h)}`}for(let a in Dl)r.has(a)||(Dl[a].remove(),delete Dl[a]);Q.region.textContent=_u(Pe.copy(i).normalize()).toUpperCase()}function Fw(){let e=((Qn(Pe.copy(k.pos).normalize()).lon+f.tod*360)/360*24.66+12)%24.66;e<0&&(e+=24.66);let t=Math.floor(e%1*60);return`LT ${String(Math.floor(e)).padStart(2,"0")}:${String(t).padStart(2,"0")}`}function $v(){let i=[["suit",f.suit,en(),Math.round(f.suit)+"%"],["o2",f.o2,100,Math.round(f.o2)+"%"],["water",f.water,Le.waterMax,f.water.toFixed(0)+"L"],["food",f.food+f.potatoes,16,`${f.food}R+${f.potatoes}P`],["power",f.power,100,Math.round(f.power)+"%"],["health",f.health,100,Math.round(f.health)+"%"]];for(let[s,r,a,o]of i){let l=Q.bars[s];l&&(l.fill.style.width=_e(r/a*100,0,100)+"%",l.val.textContent=o,l.wrap.classList.toggle("warn",r/a<.22))}let e=Uu(Pe.copy(k.pos).normalize(),ta());Ge.isTouch&&(Q.tExit.style.display=f.mode==="rover"?"flex":"none",Q.tJump.style.display=f.mode==="rover"?"none":"flex");let t=`<span class="sol">SOL ${f.sol}</span><br>${Fw()} \xB7 ${e}\xB0C`;f.mode==="rover"&&(t+=`<br><span style="font-size:11px">ROVER PWR ${Math.round(f.roverPower)} \xB7 O2 ${Math.round(f.roverO2)}</span>`),f.storm.i>.15&&(t+='<br><span style="color:#ff6f5f;font-size:11px">\u26A0 DUST STORM</span>'),Q.clock.innerHTML=t;let n=Math.max(1-f.suit/(en()*.25),1-f.health/45,f.breach.active&&f.inside?.5:0);Q.vign.style.opacity=_e(n,0,1)*.9,Q.cold.style.opacity=_e((-70-e)/40,0,1)*(f.inside?0:.85),f.disco&&(f.stats.discoTime+=1/60)}function Ou(){try{location.reload()}catch{}setTimeout(()=>bl("SYSTEM","Reload blocked by host page","Refresh the page manually to restart."),400)}function Qv(i){if(f.over)return;f.over=!0,f.dead=i,we.alarm(!1),we.disco(!1),we.bad(),we.rumble(0);let e=f.diff==="iron";e&&ho();let t=[];!e&&ea.checkpoint&&t.push({label:`WAKE AT DAWN (SOL ${ea.checkpoint.sol})`,fn:()=>Fu()}),t.push({label:"RESTART FROM SOL 1",ghost:!e,keep:!0,fn:()=>{ho(),Ou()}}),yi({title:"YOU DIED ON MARS",subtitle:`Sol ${f.sol} \xB7 ${(f.stats.driven/1e3).toFixed(1)} km driven \xB7 ${f.stats.potatoes} potatoes grown`+(e?" \xB7 SPACE PIRATE: save deleted":""),body:i+(e?`

You knew the deal.`:`

Nobody plants the flag on the first try.`),buttons:t})}function $p(){f.uiOpen||f.over||!f.started||f.mode==="cutscene"||(ks(),yi({title:"PAUSED",subtitle:"progress saved. the potatoes are fine. probably.",body:`MOVE <span class="kbd">W A S D</span> \xB7 SPRINT <span class="kbd">SHIFT</span> \xB7 JUMP <span class="kbd">SPACE</span> \xB7 INTERACT <span class="kbd">E</span> (hold)
O2 CANDLE <span class="kbd">X</span> \xB7 EXIT ROVER <span class="kbd">F</span> \xB7 CAMERA <span class="kbd">V</span> \xB7 MAP <span class="kbd">M</span> \xB7 COLONY <span class="kbd">C</span> \xB7 JOURNAL <span class="kbd">J</span>

Survive to Sol ${f.rescueSol}. Watch the six bars. The rover refills your suit;
the Hab refills the rover; the sun refills the Hab. Keep the chain alive.`,buttons:[{label:"RESUME",fn:()=>Ul()},{label:"RESTART RUN",ghost:!0,keep:!0,fn:()=>{ho(),Ou()}}]}))}function Nl(i){f.diff=i,f.rescueSol=ei[i].rescueSol,f.drainMult=ei[i].drain,Qp(),R.spawn=Rv(Math.random),f.tod=(-(R.spawn.lon+58.4)/360%1+1)%1,zs(),eb(),k.q.copy(R.hab.quaternion),Qr(k.q,.3,.9,85,12e3),ns(),Il(k.q,Jp(k.pos,R.hab.position,k.q)),k.alt=0,ns(),f.started=!0,Ul(),we.wind(.2),Ue("Suit O2 at 46% and leaking. The Hab is that way. RUN.","sys");let e=`lat ${R.spawn.lat.toFixed(1)}\xB0, lon ${R.spawn.lon.toFixed(1)}\xB0E \u2014 ${_u(R.spawn.v)}`;setTimeout(()=>Ue(`Crash site logged: ${e}. Somewhere on Mars. Emphasis on "somewhere."`),5500),is()}function Zp(i){f.diff=i.diff||"survival",f.rescueSol=ei[f.diff].rescueSol,f.drainMult=ei[f.diff].drain,R.spawn={lat:i.spawn.lat,lon:i.spawn.lon,v:Bt(i.spawn.lat,i.spawn.lon)},eb(),Qp(),Ll(i),f.started=!0,ea.checkpoint=i,Ul(),we.wind(.2),Ue(`Sol ${f.sol}. Still here. Still farming. Still winning, technically.`),i.migrated&&i.migrated.includes("terrain")&&setTimeout(()=>Ue("Survey update: the planet is now built from real orbital elevation data. Same Mars, truer ground \u2014 your colony has been re-seated on it.","nasa"),2500)}var Zv=!1;function eb(){Zv||(Zv=!0,Lv(R.spawn),Cv(R.spawn),Cl(Pe.copy(R.rover.group.position).normalize(),.8),Fv())}function tb(){let i=Yp(),e=[];i&&e.push({label:`\u25B6 CONTINUE \u2014 SOL ${i.sol}`,fn:()=>{we.init(),we.resume(),Zp(i)}}),e.push({label:i?"NEW GAME (new random site)":"\u25B6 CLICK TO SUIT UP",ghost:!!i,keep:!0,fn:()=>{we.init(),we.resume(),Nw()}}),yi({title:"STRANDED II",subtitle:"the whole planet. all of it. against you.",body:`The storm hit. The crew evac'd. Your bio-monitor said you were dead.
It exaggerated. You are stranded <b>somewhere on Mars</b> \u2014 a real Mars:
Olympus Mons, Valles Marineris, both ice caps, and every probe humanity
ever threw at this planet, rusting exactly where history left it.

Grow food. Make water. Salvage the dead landers. Find Pathfinder in
Ares Vallis. Call home. Then drive to Schiaparelli crater and fly out.

MOVE <span class="kbd">W A S D</span> \xB7 SPRINT <span class="kbd">SHIFT</span> \xB7 INTERACT <span class="kbd">E</span> hold \xB7 MAP <span class="kbd">M</span> \xB7 COLONY <span class="kbd">C</span> \xB7 JOURNAL <span class="kbd">J</span>`+(qv()?`

<b>A saved game was found, but it is from a version this build cannot read, so it cannot be continued.</b>`:""),buttons:e})}function Nw(){let i=e=>({label:ei[e].name,ghost:e!=="survival",fn:()=>Nl(e)});yi({title:"CHOOSE YOUR MARS",body:Object.keys(ei).map(e=>`<b>${ei[e].name}</b>
${ei[e].desc}`).join(`

`),buttons:[i("story"),i("survival"),i("iron")]})}var Ol={1:"Log, Sol 1. Storm hit. Crew evac'd. An antenna went through my bio-monitor, so the suit told everyone I was dead. Surprise: I'm not. I'm just... alone. On a planet.",2:"Sol 2. Did the math. Rations won't last to rescue. I'm going to have to science the sh*t out of this.",3:"Sol 3. Today's agenda: farming. On a planet where nothing grows. I am the greatest botanist on this planet.",4:"Sol 4. Fun fact: humanity has been littering Mars with robots since 1971. One of them can call home.",5:"Sol 5. Weather report: dust, followed by dust, with a chance of dust.",6:"Sol 6. The potatoes sprouted. I cried a little. Don't tell the potatoes.",7:"Sol 7. Something feels off today. On Mars, 'probably nothing' has a body count.",8:"Sol 8. Every day this planet tries to kill me, and every day I make it breakfast instead.",9:"Sol 9. More weather. My solar panels would like a word with this planet's management.",10:"Sol 10. Ten sols. The Hab smells like soil and victory. Mostly soil.",12:"Sol 12. Update: still the only person on an entire planet. The commute is unbeatable, though.",15:"Sol 15. I named a rock today. His name is Greg. This is fine.",20:"Sol 20. Told Greg about the potatoes. He was nonjudgmental, as usual.",25:"Sol 25. Halfway-ish. The potatoes and I have an understanding: I water them, they keep me alive, nobody mentions the eating part.",30:"Sol 30. I've driven further on Mars than I ever commuted on Earth. Insurance would NOT cover this.",35:"Sol 35. Mars sunsets are blue. The universe has a sense of irony and excellent taste.",40:"Sol 40. Soon. The word tastes like potatoes. Everything tastes like potatoes.",44:"Sol 44. One more sol. Packing my potato. Singular. It's symbolic.",59:"Sol 59. Tomorrow. Greg the rock is coming with me. Don't tell NASA about the mass budget."};function zs(){let i=f.tod*Math.PI*2;ce.engine.sunDir.set(Math.cos(i),0,Math.sin(i))}function kl(){return(((((R.spawn?R.spawn.lon:0)/360+f.tod+.5)%1+1)%1-6/z0)%1+1)%1}function ib(i){let e=kl();return f.tod=(f.tod+i)%1,kl()<e-.5}function ta(){return uu.copy(ce.engine.camera.position).normalize().dot(ce.engine.sunDir)}function Uu(i,e){let t=Math.abs(Math.asin(_e(i.y,-1,1))/Rs);return Math.round(-63+85*Math.max(0,e)-35*Math.pow(t/90,2)-(e<0?22:0))}var em={};function ia(i,e,t,n){e<=t&&!em[i]?(em[i]=!0,Ue(n,"sys"),we.bad()):e>t+8&&(em[i]=!1)}function Uw(){let i=0;for(let t of R.panels)i+=1-_e(t.dust,0,1);let e=i/R.panels.length;for(let t of R.builtMeshes)t.kind==="solar"&&st(t.group.position,R.hab.position)<150&&(e+=.12);return e}function nb(){return Pe.copy(R.hab.position).normalize().dot(ce.engine.sunDir)}function ku(i,e){let t=f.drainMult,n=(e?.5:1)*t,s=Le.solLen,r=_e(nb()*3,0,1),a=ta(),o=sb(R.hab.position),l=Le.solarGen/s*r*Uw()*it(1,Le.stormGenMult,o),c=Le.powerBase*(f.upgrades.insulation?.7:1);Uu(Pe.copy(R.hab.position).normalize(),nb())<-70&&!f.upgrades.rtg&&(c+=8);let u=f.upgrades.rtg?6/s:0;f.power=_e(f.power+(l+u-c/s*n)*i,0,Le.powerMax);let d=f.power>.5,p=f.upgrades.wiper?.3:1,g=it(Le.dustRate,Le.stormDustRate,o)/s*p*i;for(let x of R.panels)x.dust=_e(x.dust+g,0,1);let _=-(Le.o2Drain/s)*n;if(d&&(_+=Le.o2Gen/s),f.breach.active&&(_-=Le.o2BreachDrain/s),f.o2=_e(f.o2+_*i,0,100),e)f.suit=en();else{if(f.mode==="rover"){if(f.suit<en()&&f.roverO2>0){let x=Math.min(25*i,en()-f.suit,f.roverO2);f.suit+=x,f.roverO2-=x}st(R.rover.group.position,R.hab.position)<60&&f.o2>30&&(f.roverO2=_e(f.roverO2+10*i,0,Le.roverO2Cap))}else if(f.inside&&f.o2>3)f.suit=_e(f.suit+26*i,0,en());else{let T=zu().mag>.12?Hu()?.95:.62:.34;f.inside&&(T=.3),f.upgrades.recycler&&(T*=.75),f.flags.coldOpen&&(T*=1.9),Uu(ab(),a)<-85&&(T*=1.25),f.suit=_e(f.suit-T*t*i,0,en())}st(R.rover.group.position,R.hab.position)<60&&f.power>10&&(f.roverPower=_e(f.roverPower+Le.roverChargeAtHab/60*i,0,cr()));for(let x of R.builtMeshes)x.kind==="solar"&&st(x.group.position,R.rover.group.position)<25&&(f.roverPower=_e(f.roverPower+8/60*Math.max(0,a)*i,0,cr()))}let v=-(Le.waterDrain/s)*n;d&&(v+=Le.waterRecl/s*(f.upgrades.recycler,1)),f.water=_e(f.water+v*i,0,Le.waterMax);let m=i/s;for(let x of R.plots)x.state==="growing"&&(x.growth>=.5&&x.watered<Le.waterings||(x.growth+=m/Le.growSols,x.growth>=1?(x.growth=1,x.state="ready",e||(we.ok(),Ue("A plot is ready. Potato o'clock.","sys")),Zr(x)):Math.random()<i*.06&&Zr(x)));let y=0;f.water<=0&&(y+=Le.starveDrain/s),f.food+f.potatoes<=0&&(y+=Le.starveDrain/s);let M=f.suit<=0&&!(f.inside&&f.o2>3)&&f.mode!=="rover"&&!e;if(M&&(y+=Le.suffocateDrain),f.inside&&f.o2<=0&&f.suit<=0&&(y+=Le.suffocateDrain),f.mode==="rover"&&f.roverO2<=0&&f.suit<=0&&(y+=Le.suffocateDrain),y>0?f.health=_e(f.health-y*t*i,0,Le.healthMax):f.water>5&&f.food+f.potatoes>0&&(f.health=_e(f.health+Le.healRegen/s*n*i,0,Le.healthMax)),e||(ia("suit",f.suit,en()*.25,"Suit O2 at 25%. Head for air. Now-ish."),ia("suit2",f.suit,en()*.1,"SUIT O2 CRITICAL. RUN."),ia("o2",f.o2,25,"Hab O2 low. Oxygenator needs power. Panels need wiping. You see where this is going."),ia("water",f.water,10,"Water reserves critical. Hydrazine, ice, or thirst \u2014 pick one."),ia("power",f.power,15,"Hab battery low. Life support idles at zero. Wipe the panels."),ia("rpow",f.roverPower,20,"Rover battery low. It solar-trickles when parked in daylight."),ia("health",f.health,40,"Vitals degrading. Eat. Drink. Sleep. In any order."),f.suit<=12||f.o2<=10?f.flags.closeCall||(f.flags.closeCall=!0,f.stats.closeCalls++):f.flags.closeCall=!1),f.health<=0&&!f.over){let x="Mars. The cause is always Mars.";M?x="Asphyxiation, a long way from a door. Mars counts that as a win.":f.inside&&f.o2<=0?x="The Hab ran out of air. The potatoes watched.":f.water<=0?x="Dehydration. On a planet that used to have oceans. Rude.":f.food+f.potatoes<=0&&(x="Starvation. The botany project needed more time."),Qv(x)}}function Qp(){f.storm.cells=[];for(let i=0;i<3;i++)f.storm.cells.push({lat:(Zn(i,77,3)*2-1)*55,lon:Zn(i,13,41)*360,r:1800+Zn(i,5,9)*2600,drift:20+Zn(i,8,2)*30,dir:Zn(i,1,6)*Math.PI*2,peak:.7+Zn(i,3,3)*.3})}var Hs=new C;function tm(i,e){return Bt(i.lat,i.lon,e)}function sb(i){let e=0;Ce.copy(i).normalize();for(let t of f.storm.cells){tm(t,Hs);let n=En(Ce.x,Ce.y,Ce.z,Hs.x,Hs.y,Hs.z)*12e3;n<t.r&&(e=Math.max(e,t.peak*Hn(1,.35,n/t.r)))}if((f.sol===5||f.sol===9)&&kl()>.12&&kl()<.5){let t=st(i,R.hab.position);t<4e3&&(e=Math.max(e,.85*Hn(4e3,1200,t)))}return e}function rb(i){for(let e of f.storm.cells){let t=e.drift*i,n=tm(e,Hs);gi(n,bi,Zi),n.addScaledVector(bi,Math.cos(e.dir)*t/12e3).addScaledVector(Zi,Math.sin(e.dir)*t/12e3).normalize();let s=Qn(n);e.lat=s.lat,e.lon=s.lon,e.dir+=(Zn(Math.floor(f.sol*7),Math.floor(e.lon),3)-.5)*i*2}}function nm(i){let e=i/Le.solLen,t=ib(e);rb(e),t&&Bu();let n=sb(f.mode==="rover"?R.rover.group.position:k.pos);if(f.storm.i=_e(f.storm.i+Math.sign(n-f.storm.i)*i*.12,0,Math.max(n,f.storm.i-i*.12)),f.storm.i>.4&&!f.inside&&f.mode==="walk"&&(f.stats.stormOut+=i),f.sol>=7&&kl()>.08&&!f.breach.done&&!f.breach.active&&st(f.mode==="rover"?R.rover.group.position:k.pos,R.hab.position)<800&&!f.flags.coldOpen&&f.mode!=="cutscene"&&(f.breach.active=!0,f.breach.timer=0,f.shake=1.4,xl("rgba(255,255,255,0.5)",200),we.boom(),we.alarm(!0),Pn(),Ue("BREACH. The Hab canvas just blew. Air's screaming out. MOVE, WATNEY.","sys")),f.breach.active&&(f.breach.timer+=i,f.breach.timer>90&&!f.breach.cropsKilled)){f.breach.cropsKilled=!0;let s=0;for(let r of R.plots)r.state==="growing"&&(r.state="dead",s++,Zr(r));s&&Ue("The cold got in. The growing crops are dead. Ready trays survived. Small mercies.","sys")}}function Bu(){if(f.sol++,f.potatoes>0?f.potatoes--:f.food>0?f.food--:Ue("No breakfast. The stomach files a formal complaint.","sys"),Ol[f.sol]&&setTimeout(()=>Ue(Ol[f.sol]),1200),f.sol===4&&!f.flags.pfRevealed){f.flags.pfRevealed=!0;let i=st(k.pos,R.pathfinder.position);setTimeout(()=>Ue(`Found it in the charts: Pathfinder, dead since '97, ${vi(i)} from here in Ares Vallis. If I fetch it, I can call Earth. Road trip.`),6e3),f.flags.routePods||(f.flags.routePods=!0,Ow())}if(f.sol>=f.rescueSol&&!f.flags.mavRevealed&&im(),f.pf.connected||f.diff==="story"){for(let i of f.storm.cells)if(tm(i,Hs),En(Hs.x,Hs.y,Hs.z,Ce.copy(R.hab.position).normalize().x,Ce.y,Ce.z)*12e3<i.r+2500){setTimeout(()=>Ue("Forecast: a dust cell is drifting near the colony. Panels will hate it.","nasa"),5e3);break}}(f.sol===5||f.sol===9)&&setTimeout(()=>Ue("Sky's going brown at the horizon. Storm day. Wonderful.","sys"),3e3),is(),ks()}function Ow(){let i=st(R.hab.position,R.pathfinder.position);if(i<6e3)return;let e=Math.min(3,Math.floor(i/6e3)+1);Pe.copy(R.hab.position).normalize(),We.copy(R.pathfinder.position).normalize();for(let t=1;t<=e;t++){let n=t/(e+1);Ce.copy(Pe).lerp(We,n).normalize(),_l(ts(Ce,void 0,t*2.1),{rations:2,water:10,candle:1,scrap:1},"Open NASA route cache")}setTimeout(()=>Ue(`NASA pre-dropped ${e} supply caches along the Pathfinder route. They appear on the map. Somebody up there likes me.`,"nasa"),9e3)}function im(){f.flags.mavRevealed=!0;let i=vi(st(k.pos,R.mav.position));f.pf.connected?Ue(`Launch window is OPEN. The Ares 4 MAV is fueled and waiting in Schiaparelli crater \u2014 ${i} out. Time to fly a convertible.`,"nasa"):Ue(`Sol ${f.rescueSol}. NASA's original plan had the Ares 4 MAV launching from Schiaparelli about now \u2014 ${i} away. That rocket is my ride, phone call or no phone call.`),we.jingle()}function Bl(i){if(f.sleeping)return;f.sleeping=!0;let e={o2:f.o2,water:f.water,power:f.power,potatoes:f.potatoes,food:f.food};Q.overlay.style.display="flex",f.uiOpen=!0,Q.panel.innerHTML='<h2 style="margin-bottom:8px">SLEEPING\u2026</h2><div class="bd" id="mg-sleepbd" style="min-height:120px"></div>';let t=Pe.copy(i?R.rover.group.position:k.pos).normalize().clone(),n=0,s=!1,r=Le.solLen/40,a=t.dot(ce.engine.sunDir);for(let u=0;u<60;u++){let d=ib(r/Le.solLen);if(rb(r/Le.solLen),d&&(Bu(),s=!0),ku(r,!0),f.over){f.sleeping=!1;return}n+=r,zs();let p=t.dot(ce.engine.sunDir);if(n>Le.solLen*.1&&a<.03&&p>=.03||(a=p,n>Le.solLen*1.3))break}if(f.over){f.sleeping=!1;return}let o=document.getElementById("mg-sleepbd"),l=(u,d,p)=>{let g=d-u;return`<span style="color:${g>=0?"#7fca7f":"#ff8f7f"}">${g>=0?"+":""}${g.toFixed(1)}${p}</span>`},c=R.plots.filter(u=>u.state==="growing").length,h=R.plots.filter(u=>u.state==="ready").length;setTimeout(()=>{o&&!f.over&&(o.innerHTML=`HAB O2 ${l(e.o2,f.o2,"%")} \xB7 H2O ${l(e.water,f.water,"L")} \xB7 PWR ${l(e.power,f.power,"%")}
Breakfast: ${f.potatoes<e.potatoes?"potato. again.":f.food<e.food?"1 ration":"skipped"}
`+(c+h>0?`Farm: ${c} growing, ${h} ready
`:"")+(i?`Slept curled around the driver seat. The chiropractor is 225 million km away.
`:"")+`
<b style="font-size:22px;letter-spacing:4px">SOL ${f.sol}</b>`)},500),setTimeout(()=>{if(f.over){f.sleeping=!1;return}Yr(),f.sleeping=!1,f.health=_e(f.health+Le.sleepHeal,0,Le.healthMax),Pn(),is(),ks()},2900)}function ob(){f.pf.connected=!0,Pn(),we.jingle(),is();let i=vi(st(R.hab.position,R.mav.position)),e=[["n","MARK? MARK, IS THAT YOU? \u2014 JPL. We're receiving Pathfinder telemetry. The whole world is watching, Mark."],["w","Alive and well. Ish. Growing potatoes on a dead planet. Air holds, food's tight, morale is potato-based."],["n",`Copy. New plan: Ares 4's MAV is fueled and standing in Schiaparelli crater, ${i} from your position. Hermes swings back for a Sol ${f.rescueSol} intercept. Survive, drive, launch. We'll be there.`],["w",`So the plan is "don't die for ${Math.max(0,f.rescueSol-f.sol)} more sols, then drive ${i} and ride a rocket somebody else parked." I've had worse weekends.`],["n","We're also uploading survey tasks \u2014 old landers with parts worth salvaging. Help us close some files, we drop supplies. And Mark: everything you type is broadcast live on Earth. Language."],["w","Acknowledged. [REDACTED BY NASA]. [ALSO REDACTED]. Boy, am I glad you warned me."]],t=0,n=()=>{if(t>=e.length){Yr(),Ue("Uplink holds. Earth is one very slow text message away.","nasa"),kw(),f.sol>=f.rescueSol&&im(),is(),ks();return}let s=e.slice(0,t+1).map(([r,a])=>`<div style="margin-bottom:10px"><span class="${r==="n"?"n":"w"}">${r==="n"?"[HOUSTON]":"[WATNEY]"}</span> ${a}</div>`).join("");yi({title:"PATHFINDER UPLINK",subtitle:"signal delay: 11 minutes, mercifully compressed",body:`<div class="comms">${s}</div>`,buttons:[{label:t<e.length-1?"NEXT \u25B8":"CLOSE CHANNEL",keep:t<e.length-1,fn:()=>{t++,we.click(),n()}}]}),t===0&&we.ok()};n(),Ue("IT TALKS. Pathfinder lives. Hello, Earth. Did you miss me?"),zl("pf-connected",""),Oi()}var na=[{id:"viking1",name:"Viking Funeral",target:"Viking 1",desc:"Salvage Viking 1 (1976) in Chryse Planitia. NASA wants a photo. And the descent-stage hydrazine.",ev:["salvage","Viking 1"],loot:{scrap:4,rations:2,hydrazine:1}},{id:"spirit",name:"Wake the Dead",target:"Spirit",desc:"Recover Spirit's memory boards at Gusev crater. She earned a proper goodbye.",ev:["salvage","Spirit"],loot:{rations:3,candle:1},bp:"recycler"},{id:"oppy",name:"Oppy's Last Message",target:"Opportunity",desc:"Find Opportunity in Meridiani Planum and wipe her panels. Yes, it matters. To everyone.",ev:["salvage","Opportunity"],loot:{rations:4,circuit:1},bp:"drive2"},{id:"insight",name:"Marsquake",target:"InSight",desc:"Retrieve InSight's seismometer data from Elysium Planitia. 1300 marsquakes are waiting.",ev:["salvage","InSight"],loot:{scrap:2,candle:1},reveal:!0},{id:"phoenix",name:"Polar Express",target:"Phoenix",desc:"Reach Phoenix at the edge of the northern ice. Pack warm. Pack O2. Pack more O2.",ev:["salvage","Phoenix"],loot:{rations:4,hydrazine:2},bp:"tank2"},{id:"mars3",name:"Sirens of Mars",target:"Mars 3",desc:"Find Mars 3, silent since 1971, and recover its film canister. The first one deserves a visitor.",ev:["salvage","Mars 3"],loot:{scrap:5,rations:5,circuit:1}},{id:"breadcrumbs",name:"Breadcrumbs",target:null,desc:"Pre-position the escape: deploy an O2 Cache and a Nav Beacon at least 2 km from the Hab, toward Schiaparelli.",ev:["deploy",null],loot:{rations:3,candle:2}}];function Bs(i){if(i.target){let e=R.landers.find(t=>t.data.name===i.target);return e?e.group.position:null}return null}function kw(){for(let i of na)f.quests[i.id]||(f.quests[i.id]="active");for(let i of Object.keys(f.salvaged))zl("salvage",i);Ue("NASA uploaded survey tasks \u2014 old landers with parts worth saving. Check the journal [J]. They pay in supply pods.","nasa"),Ml({scrap:3,rations:3,candle:1},"Open NASA care package").blueprint="drill"}function zl(i,e){for(let t of na){if(f.quests[t.id]!=="active")continue;let n=!1;if(t.ev[0]==="salvage"&&i==="salvage"&&t.ev[1]===e&&(n=!0),t.id==="breadcrumbs"&&i==="deploy"){let r=!1,a=!1;for(let o of R.builtMeshes){let l=st(o.group.position,R.hab.position);l>2e3&&o.kind==="cache"&&(r=!0),l>2e3&&o.kind==="beacon"&&(a=!0)}n=r&&a}if(!n)continue;f.quests[t.id]="done",we.discovery();let s=Ml(t.loot,`Open "${t.name}" reward pod`);t.bp&&(s.blueprint=t.bp),t.reveal&&(f.flags.mapRevealed=!0,Ue("InSight's data came with NASA's full survey map. Every landmark, revealed. [M]","nasa")),Ue(`Survey task complete: ${t.name}. NASA is sending a pod.`,"nasa")}}function Gu(i,e,t){f.discovered[i]||(f.discovered[i]=!0,f.stats.discoveries++,we.discovery(),bl(t?"SITE DISCOVERED":"REGION DISCOVERED",i.toUpperCase(),e||""),Oi())}var sm=0;function lb(i){if(sm+=i,sm<1.5)return;sm=0;let e=f.mode==="rover"?R.rover.group.position:k.pos;Pe.copy(e).normalize();for(let t of R.landers)f.discovered[t.data.name]||st(e,t.group.position)<160&&Gu(t.data.name,t.data.note,!0);for(let t of ur)t.type==="bulge"||t.type==="albedo"||f.discovered[t.name]||En(Pe.x,Pe.y,Pe.z,t.v.x,t.v.y,t.v.z)<t.angR&&Gu(t.name,t.note,!1)}var Vu=[{id:"notdead",name:"Not Dead Yet",desc:"Reach the dawn of Sol 2",check:()=>f.sol>=2},{id:"phone",name:"Phone Home",desc:"Restore the Pathfinder uplink",check:()=>f.pf.connected},{id:"botanist",name:"Greatest Botanist on This Planet",desc:"Harvest 50 potatoes",check:()=>f.stats.potatoes>=50},{id:"eyebrows",name:"Both Eyebrows",desc:"Five hydrazine burns survived",check:()=>f.stats.booms>=5},{id:"arch",name:"Archaeologist of the Future",desc:"Salvage 8 historic landers",check:()=>Object.keys(f.salvaged).length>=8},{id:"olympus",name:"Peak Performance",desc:"Stand on the summit of Olympus Mons",check:()=>{let i=ur.find(e=>e.name==="Olympus Mons");return We.copy(k.pos).normalize(),En(We.x,We.y,We.z,i.v.x,i.v.y,i.v.z)*12e3<120}},{id:"hellas",name:"The Bottom of Everything",desc:"Stand on the floor of Hellas Planitia",check:()=>{let i=ur.find(e=>e.name==="Hellas Planitia");return We.copy(k.pos).normalize(),En(We.x,We.y,We.z,i.v.x,i.v.y,i.v.z)*12e3<800}},{id:"circum",name:"Circumnavigator",desc:"Drive 75.4 km \u2014 one full lap of Mars",check:()=>f.stats.driven>=75400},{id:"ice",name:"Ice to Meet You",desc:"Mine 25 ice chunks",check:()=>f.stats.mined>=25},{id:"storm",name:"Storm Rider",desc:"Spend 60 seconds outside in a dust storm",check:()=>f.stats.stormOut>=60},{id:"marathon",name:"Ares Marathon",desc:"Walk 10 km on foot",check:()=>f.stats.walked>=1e4},{id:"disco",name:"Disco Inferno",desc:"Endure 3 minutes of Lewis's playlist",check:()=>f.stats.discoTime>=180},{id:"pirate",name:"Space Pirate",desc:"Leave Mars",check:()=>f.won}];function Oi(){for(let i of Vu){if(f.achieved[i.id])continue;let e=!1;try{e=i.check()}catch{}e&&(f.achieved[i.id]=!0,we.discovery(),bl("ACHIEVEMENT",i.name,i.desc))}}var sa=null;function cb(){f.mode="cutscene",f.uiOpen=!1,Q.prompt.style.display="none",Gs();let i=Pe.copy(R.mav.position).normalize().clone();gi(i,bi,Zi);let e=R.mav.position.clone().addScaledVector(bi,-26).addScaledVector(Zi,20);if(e.normalize().multiplyScalar(St(e)+2.2),Ue("Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever."),f.pf.connected&&(f.disco=!0,we.disco(!0),setTimeout(()=>Ue("The playlist synced to the MAV. I'm launching to disco. This is my life now.","nasa"),3500)),[3,2,1].forEach((r,a)=>setTimeout(()=>{we.beep(700+r*60,.18,"square",.15),Ue(`${r}...`,"nasa")},2e3+a*1e3)),!sa){let r=ti("hermes");sa=r.root,R.hermesRing=r.part("ring"),sa.scale.setScalar(30),ce.world.add(sa)}sa.position.copy(i).multiplyScalar(12e3*1.85).addScaledVector(bi,12e3*.8);let t=5.2,n=0,s=0;R.launchAnim=r=>{if(n+=r,n<=t){ce.engine.camera.position.copy(e),Os(We.copy(R.mav.position).addScaledVector(i,8),i);return}let a=n-t;R.mavFlame.visible=!0,we.rumble(_e(a*.5,0,.85)),s=a*a*14,R.mavRocket.position.y=R.mavRocketY+s,R.mavFlame.scale.y=1+Math.random()*.4;let o=We.copy(R.mav.position).addScaledVector(i,s+8);if(s<2200)ce.engine.camera.position.copy(e).addScaledVector(i,s*.55),f.shake=_e(1-a*.06,0,1),ce.engine.camera.position.addScaledVector(Ce.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.5),Os(o,i);else{let l=Hn(2200,14e3,s);Ce.copy(i).multiplyScalar(12e3*(1.15+l*1.3)).addScaledVector(bi,12e3*.55*l),ce.engine.camera.position.lerp(Ce,1-Math.pow(.02,r)),Os(l>.6?sa.position:o,i),we.rumble(_e(1-l,.1,.85))}s>8e3&&sa.position.lerp(We.copy(i).multiplyScalar(12e3*1.85),1-Math.pow(.3,r)),s>15500&&!f.won&&Bw()}}function Bw(){f.won=!0,we.rumble(0),we.jingle(),Oi(),setTimeout(()=>we.disco(!1),6e3),ho();let i=f.stats;yi({title:"RESCUED",subtitle:`HERMES INTERCEPT CONFIRMED \xB7 SOL ${f.sol} \xB7 ${ei[f.diff].name}`,body:`<b>Watney is off the surface.</b>

Sols survived: ${f.sol}
Potatoes farmed: ${i.potatoes}
Driven: ${(i.driven/1e3).toFixed(1)} km \xB7 Walked: ${(i.walked/1e3).toFixed(1)} km
Landmarks discovered: ${i.discoveries} \xB7 Landers salvaged: ${Object.keys(f.salvaged).length}
Achievements: ${Object.keys(f.achieved).length}/${Vu.length}
Close calls: ${i.closeCalls} \xB7 Indoor explosions: ${i.booms}

"Every human being has a basic instinct to help each other out.
If a hiker gets lost, people organize a search party. This is why
they came back for me." \u2014 M. Watney, space pirate, greatest botanist
on two planets.`,buttons:[{label:"PLAY AGAIN (new random site)",keep:!0,fn:()=>Ou()}]})}function Zr(i){i.soilMesh.visible=i.state!=="empty";let e=.25+i.growth*1.05;if(i.plantsDead){i.plants.visible=i.state==="growing"||i.state==="ready",i.plantsDead.visible=i.state==="dead";let t=Math.min(1,.25+i.growth*.75);i.plants.scale.set(t,t,t);return}i.plants.visible=i.state==="growing"||i.state==="ready"||i.state==="dead",i.plants.scale.set(e,e,e),i.plants.traverse(t=>{t.material&&(i.state==="dead"?t.material.color.set(5917232):i.state==="ready"?t.material.color.set(t.geometry.type==="SphereGeometry"?7782474:5147194):t.material.color.set(t.geometry.type==="SphereGeometry"?5151290:4160047))})}function Fl(){return R.plots.filter(i=>i.state==="growing"||i.state==="ready").length}function Wu(){let i=null,e=2.2;for(let t of R.plots){if(!t.worldPos)continue;let n=st(k.pos,t.worldPos);n<e&&(e=n,i=t)}return i}Pt({pos:()=>{let i=Wu();return i?i.worldPos:null},r:2.2,hold:1.3,mode:"walk",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>{let i=Wu();if(!i)return!1;switch(i.state){case"empty":return f.inv.regolith>0?!0:"Needs soil \u2014 dig regolith outside";case"soil":return f.food+f.potatoes>0?f.water>=Le.waterPerDose?!0:"Not enough water (5L)":"No seed potato left";case"growing":return i.watered<Le.waterings&&i.growth>=.42?f.water>=Le.waterPerDose?!0:"Not enough water (5L)":`Growing \u2014 ${Math.round(i.growth*100)}%`;case"ready":case"dead":return!0}return!1},label:()=>{let i=Wu();if(!i)return"";switch(i.state){case"empty":return"Fill bed with regolith";case"soil":return`Plant seed potato (1 ${f.potatoes>0?"potato":"ration"}, 5L water)`;case"growing":return"Water the plants (5L)";case"ready":return"Harvest potatoes";case"dead":return"Clear out the dead crop"}return""},use:()=>{let i=Wu();if(i){switch(i.state){case"empty":f.inv.regolith--,i.state="soil";break;case"soil":f.potatoes>0?f.potatoes--:f.food--,f.water-=Le.waterPerDose,i.state="growing",i.growth=.04,i.watered=1,Fl()===1&&Ue("Planted. Grow, little guy. No pressure, but you're the food supply.");break;case"growing":f.water-=Le.waterPerDose,i.watered++;break;case"ready":i.state="soil",i.growth=0,i.watered=0,f.potatoes+=Le.potatoYield,f.stats.potatoes+=Le.potatoYield,we.jingle(),f.stats.potatoes===Le.potatoYield&&Ue("First harvest. I am the greatest botanist on this planet. Fear me."),Oi();break;case"dead":i.state="soil",i.growth=0,i.watered=0;break}we.ok(),Zr(i)}}});Pt({pos:()=>tn(R.hab,0,0,Wn+1.6,We),r:3.4,hold:2.2,mode:"walk",visible:()=>f.flags.coldOpen,label:()=>"Pull the antenna. Seal the suit.",use:()=>{f.flags.coldOpen=!1,f.flags.suitSealed=!0,f.suit=en(),f.shake=1.2,xl("rgba(255,60,40,0.35)",350),we.boom(),setTimeout(()=>we.ok(),600),setTimeout(()=>Ue("Suit resealed. O2 refilling. Ow. OW. Okay. Inventory time.","sys"),300),setTimeout(()=>Ue(Ol[1]),1e3)}});function db(i,e,t,n,s){Pt({pos:()=>tn(R.hab,e,0,t,We),r:2.6,hold:.7,mode:"walk",pose:"stand",visible:()=>f.started&&!f.flags.coldOpen&&!f.checkedSystems[i],label:()=>`Inspect the ${n}`,use:()=>{f.checkedSystems[i]=!0,we.ok(),Ue(s)}})}db("oxy",5.6,-3.6,"oxygenator","Oxygenator: alive. It eats CO2 and power, makes air. My favorite roommate.");db("rec",5.9,-.4,"water reclaimer","Water reclaimer: functional. Yes, it recycles what you think it recycles. No, we don't discuss it.");function qu(i,e,t,n){let s=null,r=t;for(let a of i){if(n&&!n(a))continue;let o=st(k.pos,e(a));o<r&&(r=o,s=a)}return s}function hb(i){return Ce.copy(i.group.position).applyQuaternion(R.solarGroup.quaternion).add(R.solarGroup.position)}Pt({pos:()=>{let i=qu(R.panels,hb,3);return i?hb(R._activePanel=i):null},r:3,hold:1.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,enabled:()=>R._activePanel&&R._activePanel.dust>.06?!0:"Panel is clean",label:()=>`Wipe solar panel (${Math.round((1-(R._activePanel?R._activePanel.dust:0))*100)}% output)`,use:()=>{let i=R._activePanel;i&&(i.dust=0,f.stats.panels++,Pn(),we.ok(),f.stats.panels===1&&Ue("Wiped a panel. Immediately covered in dust myself. The circle of Mars."))}});Pt({pos:()=>{let i=qu(R.soilPiles,e=>e.group.position,2.8,e=>e.left>0);return i?(R._activePile=i).group.position:null},r:2.8,hold:1.4,mode:"walk",visible:()=>!f.flags.coldOpen,label:()=>"Dig regolith (+1)",use:()=>{let i=R._activePile;!i||i.left<=0||(i.left--,f.inv.regolith++,Pn(),we.pickup())}});Pt({pos:()=>k.pos,r:99,hold:2.6,mode:"walk",priority:9,visible:()=>!f.flags.coldOpen&&!f.inside&&f.flags.didMath,label:()=>"Dig regolith here (+1, slow)",use:()=>{f.inv.regolith++,we.pickup()}});Pt({pos:()=>tn(R.hab,5.5,0,2.6,We),r:2.4,hold:2,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.hydrazine>0?!0:"Hydrazine tank is empty",label:()=>`Burn hydrazine for water (+${Le.hydrazineWater}L) \u2014 ${f.hydrazine} left`,use:()=>{f.hydrazine--,f.water=_e(f.water+Le.hydrazineWater,0,Le.waterMax),R.hydFlame.visible=!0,setTimeout(()=>{R.hydFlame.visible=!1},2600),f.flags.hydrazineBoom?(f.stats.booms++,we.ok(),Ue(`+${Le.hydrazineWater}L water. Eyebrow count stable. Progress.`),Oi()):(f.flags.hydrazineBoom=!0,f.stats.booms++,setTimeout(()=>{f.shake=1.6,f.o2=_e(f.o2-7,0,100),xl("rgba(255,180,80,0.75)",500),we.boom(),Ue("So. Small fireball. Eyebrows: gone. Water: acquired. Science!")},1200),Ue("Burning rocket fuel indoors. What could possibly go wrong?"))}});Pt({pos:()=>tn(R.hab,-5,0,-4.9,We),r:2.3,hold:1.2,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.breach.active?"Not with the Hab screaming, no":ta()>.25?"Too much daylight to waste":!0,label:()=>"Sleep until dawn",use:()=>Bl(!1)});Pt({pos:()=>tn(R.hab,4.2,0,4.8,We),r:2.2,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.health>92?"Not hungry right now":f.potatoes>0||f.food>0?!0:"The shelf is bare",label:()=>`Eat a ${f.potatoes>0?"potato. Again.":"ration"} (+12 vitals)`,use:()=>{f.potatoes>0?f.potatoes--:f.food--,f.health=_e(f.health+12,0,Le.healthMax),we.ok()}});Pt({pos:()=>tn(R.hab,0,0,-6.6,We),r:2.4,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&!f.flags.didMath,label:()=>"Run the numbers",use:()=>{f.flags.didMath=!0,we.ok(),Ue(`${f.food} rations. Rescue window: Sol ${f.rescueSol}. The math says: farm or starve. I'm going to have to science the sh*t out of this.`)}});Pt({pos:()=>tn(R.hab,-.9,0,-6.4,We),r:2.2,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&f.pf.connected,label:()=>"Message NASA",use:()=>{let i=["Please tell Commander Lewis her taste in music is a war crime. \u2014 M.W.","Status: alive. Potatoes: thriving. Dignity: pending. \u2014 M.W.","NASA says the whole world is watching. Waved at the sky. Felt weird. Did it again.","Asked NASA for pizza. Received an orbital mechanics refresher. Same thing, apparently.","NASA reminds me everything I type is broadcast live to Earth. So. Hi, Mom."];we.ok(),Ue(i[(f.flags.nasaMsg=f.flags.nasaMsg+1)%i.length],"nasa")}});Pt({pos:()=>tn(R.hab,.9,0,-6.4,We),r:2.2,hold:.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&f.pf.connected,label:()=>f.disco?"Mercifully stop the disco":"Play Lewis's disco playlist",use:()=>{f.disco=!f.disco,we.disco(f.disco),Ue(f.disco?"Disco: ON. I hate it. ...It's growing on me. I hate that more.":"Disco: OFF. Blessed silence.")}});Pt({pos:()=>tn(R.hab,-4.6,0,3.9,We),r:2.4,hold:.5,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,label:()=>"Use the fabricator [C]",use:()=>ra("colony")});Pt({pos:()=>R.rover.group.position,r:3.8,hold:.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,label:()=>"Drive the rover",sub:()=>`PWR ${Math.round(f.roverPower)}/${cr()} \xB7 O2 tank ${Math.round(f.roverO2)}`,use:()=>Gv()});Pt({pos:()=>R.rover.group.position,r:1e9,hold:.4,mode:"rover",visible:()=>Math.abs(mt.speed)<1.5&&ta()>=.05,label:()=>"Step out",use:()=>Pl()});Pt({pos:()=>R.rover.group.position,r:1e9,hold:2.2,mode:"rover",visible:()=>Math.abs(mt.speed)<1.5&&ta()<.05,label:()=>"Camp in the rover until dawn",sub:()=>"press F to step out instead",use:()=>Bl(!0)});Pt({pos:()=>R.pathfinder.position,r:5.5,hold:2.6,mode:"walk",visible:()=>f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected,enabled:()=>st(R.rover.group.position,R.pathfinder.position)<20?!0:"Too heavy to carry \u2014 bring the rover closer",label:()=>"Dig out Pathfinder and load it up",use:()=>{f.pf.loaded=!0,f.pf.found=!0,R.pfCollider.r=.001,Pn(),we.jingle(),Ue("Hello, little guy. You've been dead since 1997. Let's fix that. Next stop: home.")}});Pt({pos:()=>R.uplink.position,r:5,hold:2.6,mode:"walk",pose:"stand",visible:()=>f.pf.loaded&&!f.pf.connected,enabled:()=>st(R.rover.group.position,R.uplinkRing.position)<9?!0:"Park the rover on the marked ring first",label:()=>"Connect Pathfinder to the uplink",use:()=>ob()});var ub={Spirit:3,"Beagle 2":1,InSight:2,Curiosity:1,Zhurong:1,Opportunity:2};Pt({pos:()=>{let i=qu(R.landers,e=>e.group.position,5,e=>e.data.name!=="Pathfinder"&&!f.salvaged[e.data.name]);return i?(R._activeLander=i).group.position:null},r:5,hold:2.4,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,label:()=>R._activeLander?`Salvage ${R._activeLander.data.name} (${R._activeLander.data.year})`:"",use:()=>{let i=R._activeLander;if(!i||f.salvaged[i.data.name])return;f.salvaged[i.data.name]=!0;let e={scrap:i.data.scrap};ub[i.data.name]&&(e.circuit=ub[i.data.name]);let t=Vp(e);Ue(`Salvaged ${i.data.name}: ${t}. ${i.data.note}`,"disc"),Gu(i.data.name,i.data.note,!0),zl("salvage",i.data.name),Oi()}});Pt({pos:()=>{let i=qu(R.iceSites,e=>e.group.position,4.5,e=>e.left>0);return i?(R._activeIce=i).group.position:null},r:4.5,hold:1.6,mode:"walk",visible:()=>!f.flags.coldOpen,enabled:()=>f.upgrades.drill?!0:"Needs the Ice Drill upgrade",label:()=>`Mine water ice (+1, ${R._activeIce?R._activeIce.left:0} left)`,use:()=>{let i=R._activeIce;!i||i.left<=0||(i.left--,f.inv.ice++,f.stats.mined++,Xp(i),we.pickup(),Oi())}});Pt({pos:()=>{let i=null,e=4.5;for(let t of R.pods){if(t.taken)continue;let n=st(k.pos,t.group.position);n<e&&(e=n,i=t)}return i?(R._activePod=i).group.position:null},r:4.5,hold:1.6,mode:"walk",visible:()=>!f.flags.coldOpen,label:()=>R._activePod?R._activePod.label:"",use:()=>{let i=R._activePod;if(!i||i.taken)return;i.taken=!0,qp(i);let e=Vp(i.loot);Ue(`Recovered: ${e}.`),i.blueprint&&(f.blueprints[i.blueprint]=!0,Ue(`NASA attached schematics: ${i.blueprint.toUpperCase()} blueprint unlocked.`,"nasa"))}});Pt({pos:()=>R.rtgSite.group.position,r:4,hold:3,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&!R.rtgSite.taken&&f.flags.didMath,label:()=>"Dig up the RTG (radioactive. cozy.)",use:()=>{R.rtgSite.taken=!0,Pn(),f.flags.hasRtg=!0,we.pickup(),Ue("One RTG: a plutonium space-heater NASA buried out of an abundance of caution. I am strapping it to my life. Socket it at the fabricator.")}});Pt({pos:()=>tn(R.hab,0,0,-Wn+1.2,We),r:3.2,hold:3,mode:"walk",pose:"stand",visible:()=>f.breach.active&&f.inside,label:()=>"Seal the breach (canvas, tape, prayer)",use:()=>{f.breach.active=!1,f.breach.done=!0,we.alarm(!1),we.ok(),f.shake=.5,Pn(),Ue(f.breach.cropsKilled?"Sealed. Too late for the crops. The Hab and I are no longer on speaking terms.":"Breach sealed. Crops: alive. Heart rate: unpublishable. Duct tape: undefeated.")}});Pt({pos:()=>{let i=null,e=3.5;for(let t of R.builtMeshes){if(t.kind!=="cache"||t.charges<=0)continue;let n=st(k.pos,t.group.position);n<e&&(e=n,i=t)}return i?(R._activeCache=i).group.position:null},r:3.5,hold:1,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,enabled:()=>f.suit<en()-5?!0:"Suit is full",label:()=>`Refill suit O2 (${R._activeCache?R._activeCache.charges:0} charges left)`,use:()=>{let i=R._activeCache;!i||i.charges<=0||(i.charges--,f.suit=_e(f.suit+40,0,en()),we.ok())}});var ki=null;function fb(i){ki=i,Gs(),Ue("Pick a spot outside and place it.","sys")}Pt({pos:()=>k.pos,r:99,hold:1.6,mode:"walk",priority:2,visible:()=>!!ki&&!f.inside,label:()=>`Place the ${pr["kit"+ki.charAt(0).toUpperCase()+ki.slice(1)]||ki} here`,use:()=>{let i="kit"+ki.charAt(0).toUpperCase()+ki.slice(1);if((f.inv[i]||0)<=0){ki=null;return}f.inv[i]--;let e=ki;Pe.copy(k.pos).normalize(),We.set(0,0,-1).applyQuaternion(k.q),Pe.addScaledVector(We,(e==="greenhouse"?6.4:2.6)/12e3).normalize(),gi(Pe,Gn,Vn),ao(e,Pe,Math.atan2(-We.dot(Gn),-We.dot(Vn))),we.craft(),Ue(`${pr[i]} deployed. Mars: 0, engineering: 1.`),Pn(),zl("deploy",ki),ki=null,Oi()}});Pt({pos:()=>R.mav.position,r:8,hold:3,mode:"walk",pose:"stand",visible:()=>f.flags.mavRevealed&&!f.flags.mavStripped,enabled:()=>f.sol>=f.rescueSol?!0:`Launch window opens Sol ${f.rescueSol} \u2014 NASA was firm about this`,label:()=>"Strip excess weight (nose cone, seats, dignity)",use:()=>{f.flags.mavStripped=!0,R.mavNose&&(R.mavNose.visible=!1),we.ok(),Ue("Removed the nose cone. NASA says the tarp will hold. NASA is lying, and we both know it.")}});Pt({pos:()=>R.mav.position,r:8,hold:1.6,mode:"walk",pose:"stand",visible:()=>f.flags.mavStripped&&!f.won,label:()=>"Climb in. Go home.",use:()=>{yi({title:"LAUNCH?",body:`The MAV is a convertible now. The math says Hermes can catch you.
The math has been wrong before.

No coming back. The potatoes forgive you.`,buttons:[{label:"PUNCH IT",fn:()=>cb()},{label:"Not yet",ghost:!0,fn:()=>{}}]})}});function Cn(){return Q.mapScreen.style.display==="block"||Q.colonyScreen.style.display==="block"||Q.journalScreen.style.display==="block"}function Gs(){Q.mapScreen.style.display="none",Q.colonyScreen.style.display="none",Q.journalScreen.style.display="none"}for(let i of[Q.mapScreen,Q.colonyScreen,Q.journalScreen]){let e=i.querySelector(".close");e.addEventListener("click",t=>{t.stopPropagation(),we.click(),Gs()}),e.addEventListener("touchstart",t=>{t.preventDefault(),t.stopPropagation(),we.click(),Gs()},{passive:!1})}function ra(i){let t={map:Q.mapScreen,colony:Q.colonyScreen,journal:Q.journalScreen}[i],n=t.style.display==="block";if(Gs(),!n){t.style.display="block";try{document.exitPointerLock&&document.exitPointerLock()}catch{}i==="map"&&om(),i==="colony"&&am(),i==="journal"&&zw(),we.click()}}var Hl=1440,Xu=720;function rm(i,e){return[(e%360+360)%360/360*Hl,(90-i)/180*Xu]}function pb(i){let e=Qn(Pe.copy(i).normalize());return rm(e.lat,e.lon)}function om(){let i=Q.mapCanvas;i.width=Hl,i.height=Xu,i.style.width="min(100%, 1200px)";let e=i.getContext("2d");ce.mapImage?e.drawImage(ce.mapImage,0,0,Hl,Xu):(e.fillStyle="#5a2d1a",e.fillRect(0,0,Hl,Xu)),e.font="9px monospace",e.fillStyle="rgba(255,230,200,0.75)";for(let n of xu){let[s,r]=rm(n.lat,n.lon);e.fillText(n.name,s-n.name.length*2.2,r)}for(let n of f.storm.cells){let[s,r]=rm(n.lat,n.lon);e.beginPath(),e.arc(s,r,n.r/(2*Math.PI*12e3)*Hl,0,Math.PI*2),e.fillStyle="rgba(160,90,40,0.35)",e.fill()}let t=(n,s,r)=>{let[a,o]=pb(n);e.fillStyle=s,e.fillRect(a-2,o-2,4,4),r&&(e.fillStyle=s,e.fillText(r,a+4,o+3))};for(let n of R.landers)f.discovered[n.data.name]?t(n.group.position,"#9ecfff",n.data.name):f.flags.mapRevealed&&t(n.group.position,"rgba(158,207,255,0.45)","?");for(let n of R.builtMeshes)t(n.group.position,n.kind==="beacon"?"#4fd8ff":"#c0b090",n.kind==="beacon"?"beacon":"");for(let n of R.pods)n.taken||t(n.group.position,"#ffd27f","cache");f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected&&t(R.pathfinder.position,"#ffef9e","PATHFINDER"),t(R.mav.position,f.flags.mavRevealed?"#ff7f5f":"rgba(255,127,95,0.5)","ARES 4 MAV"),t(R.hab.position,"#7fff9e","HAB"),t(R.rover.group.position,"#ffb45e","rover");{let[n,s]=pb(k.pos);e.fillStyle="#ffffff",e.beginPath(),e.arc(n,s,3,0,Math.PI*2),e.fill()}Q.mapScreen.querySelector("#mg-maplegend").innerHTML=`SOL ${f.sol} \xB7 lat ${Qn(Pe.copy(k.pos).normalize()).lat.toFixed(1)}\xB0 lon ${Qn(Pe).lon.toFixed(1)}\xB0E \xB7 discovered ${f.stats.discoveries} \xB7 storms shown as brown cells`}function am(){let i=Q.colonyScreen.querySelector("#mg-inv"),e=Q.colonyScreen.querySelector("#mg-craft"),t=Q.colonyScreen.querySelector("#mg-build"),n="<h3>SUPPLIES</h3>";n+=`<div class="mg-item"><span>Rations</span><span>${f.food}</span></div>`,n+=`<div class="mg-item"><span>Potatoes</span><span>${f.potatoes}</span></div>`,n+=`<div class="mg-item"><span>Water</span><span>${f.water.toFixed(0)}L</span></div>`,n+=`<div class="mg-item"><span>Hydrazine burns</span><span>${f.hydrazine}</span></div>`,n+="<h3>MATERIALS</h3>";for(let o of["scrap","circuit","regolith","ice","candle"])n+=`<div class="mg-item"><span>${pr[o]}</span><span>${f.inv[o]||0}</span></div>`;n+="<h3>KITS (craft, then place outside)</h3>";for(let o of["kitSolar","kitGreenhouse","kitBeacon","kitCache"]){let l=f.inv[o]||0;n+=`<div class="mg-item"><span>${pr[o]}</span><span>${l}${l>0?` <button class="mg-btn" style="padding:2px 8px;font-size:10px" data-deploy="${o.slice(3).toLowerCase()}">DEPLOY</button>`:""}</span></div>`}f.flags.hasRtg&&!f.upgrades.rtg&&(n+='<div class="mg-item"><span>RTG (unsocketed)</span><span>\u2622</span></div>'),i.innerHTML=n,i.querySelectorAll("[data-deploy]").forEach(o=>o.onclick=()=>fb(o.dataset.deploy));let s=Cu(),r=`<h3>FABRICATOR ${s?"":"\u2014 out of range (return to the Hab)"}</h3>`;for(let o of Hp){let l=s&&Al(o.cost);r+=`<div class="mg-recipe"><div class="rn">${o.name}</div><div class="rc">${o.desc}<br>needs: ${Gp(o.cost)}</div><button data-r="${o.id}" ${l?"":"disabled"}>FABRICATE</button></div>`}e.innerHTML=r,e.querySelectorAll("button[data-r]").forEach(o=>o.onclick=()=>{let l=Hp.find(c=>c.id===o.dataset.r);if(!(!l||!Al(l.cost)||!Cu())){if(l.run){let c=l.run();if(c!==!0){Ue(c,"sys");return}Ru(l.cost)}else{Ru(l.cost);for(let c in l.gives)f.inv[c]=(f.inv[c]||0)+l.gives[c]}f.stats.crafted++,we.craft(),am()}});let a="<h3>UPGRADES</h3>";for(let o of Au){if(f.upgrades[o.id]){a+=`<div class="mg-recipe"><div class="rn">\u2713 ${o.name}</div><div class="rc">${o.desc}</div></div>`;continue}let l=null;o.bp&&!f.blueprints[o.bp]&&(l="blueprint required (survey tasks)"),o.needs&&!f.upgrades[o.needs]&&(l=`requires ${Au.find(h=>h.id===o.needs).name}`),o.needsRtg&&!f.flags.hasRtg&&(l="requires the buried RTG");let c=s&&!l&&Al(o.cost);a+=`<div class="mg-recipe"><div class="rn">${o.name}</div><div class="rc">${o.desc}<br>needs: ${Gp(o.cost)}${l?"<br>\u26A0 "+l:""}</div><button data-u="${o.id}" ${c?"":"disabled"}>INSTALL</button></div>`}t.innerHTML=a,t.querySelectorAll("button[data-u]").forEach(o=>o.onclick=()=>{let l=Au.find(c=>c.id===o.dataset.u);!l||f.upgrades[l.id]||!Cu()||!Al(l.cost)||l.bp&&!f.blueprints[l.bp]||l.needs&&!f.upgrades[l.needs]||l.needsRtg&&!f.flags.hasRtg||(Ru(l.cost),f.upgrades[l.id]=!0,f.stats.crafted++,we.craft(),Ue(`Installed: ${l.name}. ${l.desc}.`),am())})}function zw(){let i=Q.journalScreen.querySelector("#mg-quests"),e=Q.journalScreen.querySelector("#mg-discoveries"),t=Q.journalScreen.querySelector("#mg-achievements"),n="<h3>NASA SURVEY TASKS</h3>";if(!f.pf.connected)n+='<div class="mg-jrow locked"><div class="jn">No uplink</div><div class="jd">Restore Pathfinder to receive survey tasks.</div></div>';else for(let a of na){let o=f.quests[a.id],l=Bs(a)?` \u2014 ${vi(st(k.pos,Bs(a)))}`:"";n+=`<div class="mg-jrow"><div class="jn">${o==="done"?"\u2713 ":""}${a.name}${l}</div><div class="jd">${a.desc}</div></div>`}i.innerHTML=n;let s=`<h3>DISCOVERIES (${f.stats.discoveries})</h3>`;for(let a of R.landers){let o=f.discovered[a.data.name];s+=`<div class="mg-jrow${o?"":" locked"}"><div class="jn">${o?a.data.name+" ("+a.data.year+")":"??? \u2014 undiscovered lander"}</div><div class="jd">${o?a.data.note:"Find it out there."}</div></div>`}for(let a of ur){if(a.type==="bulge"||a.type==="albedo"||!a.note)continue;let o=f.discovered[a.name];s+=`<div class="mg-jrow${o?"":" locked"}"><div class="jn">${o?a.name:"??? \u2014 uncharted region"}</div><div class="jd">${o?a.note:""}</div></div>`}e.innerHTML=s;let r="<h3>ACHIEVEMENTS</h3>";for(let a of Vu){let o=f.achieved[a.id];r+=`<div class="mg-jrow ach${o?"":" locked"}"><div class="jn">${o?"\u2605 ":"\u2606 "}${a.name}</div><div class="jd">${a.desc}</div></div>`}t.innerHTML=r}var Ge={keys:{},eHeld:!1,yaw:0,pitch:0,isTouch:"ontouchstart"in window||navigator.maxTouchPoints>0,touch:{joyX:0,joyY:0,joyId:null,lookId:null,lookX:0,lookY:0,sprint:!1,jumpT:0},sensitivity:1},uo=!1,Vs=!1,lm=!1,cm=0,hm=0,mb=0;function Ul(){if(Vs&&Ge.isTouch||f.uiOpen||Cn())return;let i=ce.engine.renderer.domElement;try{let e=i.requestPointerLock&&i.requestPointerLock();e&&e.catch&&e.catch(()=>{Vs=!0}),setTimeout(()=>{!uo&&!f.uiOpen&&!Cn()&&(Vs=!0)},700)}catch{Vs=!0}}function gb(){return Ge.isTouch&&Nn()-Ge.touch.jumpT<.18}function zu(){let i=Ge.keys,e=0,t=0;(i.w||i.arrowup)&&(t-=1),(i.s||i.arrowdown)&&(t+=1),(i.a||i.arrowleft)&&(e-=1),(i.d||i.arrowright)&&(e+=1),e+=Ge.touch.joyX,t+=Ge.touch.joyY;let n=Math.hypot(e,t);return{mx:e,mz:t,mag:Math.min(1,n)}}function Hu(){return!!Ge.keys.shift||Ge.touch.sprint}function vb(){let i=ce.engine.renderer.domElement,e=Ge.keys;window.addEventListener("keydown",t=>{if(t.repeat)return;let n=t.key.toLowerCase();e[n]=!0,["w","a","s","d"," ","arrowup","arrowdown","arrowleft","arrowright"].includes(n)&&t.preventDefault(),n==="e"&&(Ge.eHeld=!0),!(!f.started||f.over||f.mode==="cutscene")&&(n==="escape"&&(Cn()?Gs():f.uiOpen||$p()),n==="f"&&f.mode==="rover"&&!f.uiOpen&&!Cn()&&Pl(),n==="v"&&!f.uiOpen&&!Cn()&&(f.firstPerson=!f.firstPerson,Ue(f.firstPerson?"Helmet cam. Just you and the visor.":"Suit cam deployed. Looking good, Watney. Ish.","sys")),!f.uiOpen&&!f.flags.coldOpen&&(n==="m"&&ra("map"),n==="c"&&ra("colony"),n==="j"&&ra("journal")))}),window.addEventListener("keyup",t=>{let n=t.key.toLowerCase();e[n]=!1,n==="e"&&(Ge.eHeld=!1,f.holdT=0)}),window.addEventListener("blur",()=>{for(let t in e)e[t]=!1;Ge.eHeld=!1}),document.addEventListener("pointerlockchange",()=>{uo=document.pointerLockElement===i,mb=Nn(),uo&&(Vs=!1),!uo&&f.started&&!f.uiOpen&&!Cn()&&!f.over&&f.mode!=="cutscene"&&$p()}),document.addEventListener("pointerlockerror",()=>{Vs=!0}),i.addEventListener("mousedown",t=>{!f.started||f.uiOpen||Cn()||(uo||Ul(),Vs&&(lm=!0,cm=t.clientX,hm=t.clientY))}),window.addEventListener("mouseup",()=>{lm=!1}),window.addEventListener("mousemove",t=>{if(!f.started||f.uiOpen||Cn()||f.mode==="cutscene")return;let n=0,s=0;if(uo){if(Nn()-mb<.15||(n=t.movementX||0,s=t.movementY||0,Math.abs(n)>400||Math.abs(s)>400))return}else if(Vs&&lm)n=t.clientX-cm,s=t.clientY-hm,cm=t.clientX,hm=t.clientY;else return;Ge.yaw-=n*.0024*Ge.sensitivity,Ge.pitch-=s*.0022*Ge.sensitivity}),Ge.isTouch&&Hw(i)}function Hw(i){let e=Ge.touch;Vs=!0,Q.touch.style.display="block";let t=(r,a)=>{Q.joyKnob.style.left=40+r*40+"px",Q.joyKnob.style.top=40+a*40+"px"};Q.joy.addEventListener("touchstart",r=>{r.preventDefault(),r.stopPropagation(),e.joyId=r.changedTouches[0].identifier},{passive:!1}),window.addEventListener("touchmove",r=>{for(let a of r.changedTouches){if(a.identifier!==e.joyId)continue;let o=Q.joy.getBoundingClientRect(),l=(a.clientX-(o.left+o.width/2))/(o.width/2),c=(a.clientY-(o.top+o.height/2))/(o.height/2),h=Math.hypot(l,c);h>1&&(l/=h,c/=h),e.joyX=l,e.joyY=c,t(l,c),r.preventDefault()}},{passive:!1});let n=r=>{for(let a of r.changedTouches)a.identifier===e.joyId&&(e.joyId=null,e.joyX=0,e.joyY=0,t(0,0)),a.identifier===e.lookId&&(e.lookId=null)};window.addEventListener("touchend",n),window.addEventListener("touchcancel",n),i.addEventListener("touchstart",r=>{if(!(!f.started||f.uiOpen||Cn()))for(let a of r.changedTouches)a.identifier===e.joyId||e.lookId!==null||(e.lookId=a.identifier,e.lookX=a.clientX,e.lookY=a.clientY)},{passive:!0}),window.addEventListener("touchmove",r=>{for(let a of r.changedTouches)a.identifier===e.lookId&&(Ge.yaw-=(a.clientX-e.lookX)*.005*Ge.sensitivity,Ge.pitch-=(a.clientY-e.lookY)*.0045*Ge.sensitivity,e.lookX=a.clientX,e.lookY=a.clientY)},{passive:!0});let s=(r,a,o)=>{r.addEventListener("touchstart",l=>{l.preventDefault(),l.stopPropagation(),a()},{passive:!1}),o&&r.addEventListener("touchend",l=>{l.preventDefault(),o()},{passive:!1})};s(Q.tE,()=>{Ge.eHeld=!0},()=>{Ge.eHeld=!1,f.holdT=0}),s(Q.tJump,()=>{e.jumpT=Nn()}),s(Q.tSprint,()=>{e.sprint=!e.sprint,Q.tSprint.classList.toggle("on",e.sprint)}),s(Q.tExit,()=>{f.mode==="rover"&&Pl()}),Q.tRow.querySelectorAll("[data-t]").forEach(r=>{s(r,()=>{if(!f.started||f.uiOpen)return;let a=r.dataset.t;a==="cam"?f.firstPerson=!f.firstPerson:ra(a)})})}var bb=new ke;function Os(i,e){let t=ce.engine.camera;bb.lookAt(t.position,i,e),t.quaternion.setFromRotationMatrix(bb)}var k={q:new dt,pitch:-.12,alt:0,vy:0,onGround:!0,bob:0,pos:new C,up:new C(0,1,0),eyeH:1.68,vx:0,vz:0,face:0,speed:0,slope:0,landT:9,airT:0,radius:.42};function gr(i,e){$i(Pe.copy(i).normalize(),e||0,k.q),k.alt=0,k.vy=0,k.vx=0,k.vz=0,k.onGround=!0,ns(),Ft.init=!1}function ns(){k.up.set(0,1,0).applyQuaternion(k.q);let i=St(k.up);k.pos.copy(k.up).multiplyScalar(i+k.alt),R.playerPos=k.pos}var ju=new C;function Qr(i,e,t,n,s){ju.set(t,0,-e),!(ju.lengthSq()<1e-12)&&(ju.normalize(),i.multiply(Ps.setFromAxisAngle(ju,n/s)))}function Il(i,e){i.multiply(Ps.setFromAxisAngle(gl,e))}var Gw=1.1,Yu=11.75,_b=2.4;function xb(i,e,t,n,s,r,a,o,l){Fs(e,We.copy(Pe).multiplyScalar(St(Pe)),Ce);let c=Math.hypot(Ce.x,Ce.z);if(c>l+6||Math.abs(Ce.y)>6)return!1;let h=Ce.x,u=Ce.z,d=!1,p=Math.abs(Math.atan2(h,u))<=r||Math.abs(h)<a&&u>0;if(Math.abs(c-n)<s&&c>.001&&!p){let g=c<n?n-s:n+s;h=h/c*g,u=u/c*g,d=!0}if(u>n-.3&&u<l+t&&Math.abs(h)<o+t){let g=a-t*.6;Math.abs(h)<=a+.25&&u<l?Math.abs(h)>g&&(h=Math.sign(h)*g,d=!0):u<l&&(h=Math.sign(h)*(o+t),d=!0)}return d?(tn(e,h,Ce.y,u,We),We.normalize(),xi.setFromUnitVectors(Pe,We),i.premultiply(xi),Pe.set(0,1,0).applyQuaternion(i),!0):!1}function Lu(i,e){Pe.set(0,1,0).applyQuaternion(i);let t=!1,n=(s,r)=>{let a=En(Pe.x,Pe.y,Pe.z,s.x,s.y,s.z)*12e3,o=r+e;if(a<o&&a>.01){if(We.copy(Pe).sub(Ce.copy(s).multiplyScalar(Pe.dot(s))),We.lengthSq()<1e-12)return;We.normalize(),Ce.copy(s).multiplyScalar(12e3).addScaledVector(We,o),Ce.normalize(),xi.setFromUnitVectors(Pe,Ce),i.premultiply(xi),Pe.set(0,1,0).applyQuaternion(i),t=!0}};for(let s of fr)f.mode==="rover"&&s===R.roverCollider||n(s.v,s.r);for(let s of Tl)n(s.v,s.r);R.hab&&xb(i,R.hab,e,Wn,.5+e*.5,Av+.02,Gw,_b,Yu)&&(t=!0);for(let s of R.builtMeshes)s.kind==="greenhouse"&&xb(i,s.group,e,Ni.wall,.1+e*.75,Math.asin(Ni.doorHalf/Ni.wall),Ni.doorHalf,Ni.portalOuter,Ni.portalEnd)&&(t=!0);return t}var ss=null,Ze={mixer:null,actions:{},current:null,bones:{},lamp:null,lampMats:[],inner:null,seated:!1,stepPhase:0,lastClipTime:0},Vw=5.1,Ww=9.2;function Mb(){let i=ti("astronaut",{face:!0});ss=i.root,Ze.inner=i.inner,Ze.mixer=new Zo(i.inner);for(let s of i.clips){let r=Ze.mixer.clipAction(s);["JumpStart","Land","Collapse","Wave"].includes(s.name)&&(r.setLoop(Lh,1),r.clampWhenFinished=!0),Ze.actions[s.name]=r}for(let s of["hips","spine","chest","neck","head"])Ze.bones[s]=i.part(s);Ze.rest={chest:Ze.bones.chest.quaternion.clone(),head:Ze.bones.head.quaternion.clone()};let e=new Ms(16774368,0,34,.5,.7,1.2),t=i.part("eye")||Ze.bones.head,n=new Tt;n.position.set(0,-1.1,8),e.position.set(0,.12,.1),t.add(e,n),e.target=n,Ze.lamp=e,i.inner.traverse(s=>{if(s.isMesh){let r=Array.isArray(s.material)?s.material:[s.material];for(let a of r)a.name==="light_white"&&Ze.lampMats.push(a)}}),ce.world.add(ss),Bi("Idle",0)}function Bi(i,e=.22,t=!1){let n=Ze.actions[i];n&&(Ze.current===n&&!t||(n.reset(),n.enabled=!0,n.setEffectiveWeight(1),n.setEffectiveTimeScale(1),Ze.current&&Ze.current!==n&&n.crossFadeFrom(Ze.current,e,!1),n.play(),Ze.current=n,Ze.name=i))}function qw(){let i=Ui.active;return i&&i.pose==="stand"?"WorkStand":"WorkKneel"}function Sb(i){if(!ss)return;let e=f.mode==="rover";if(e!==Ze.seated){Ze.seated=e;let o=R.rover&&R.rover.seat;e&&o?(o.add(ss),ss.position.set(0,-.52,0),ss.quaternion.identity(),Ze.inner.rotation.y=0):(ce.world.add(ss),Ze.inner.rotation.y=Math.PI)}ss.visible=e?!!(R.rover&&R.rover.seat):!f.firstPerson&&!f.sleeping&&!(Ft.init&&Ft.dist<1)||f.over;let t=Ge.eHeld&&Ui.active&&f.holdT>.02&&!e,n=1;if(f.over&&f.dead?Bi("Collapse",.25):e?Bi("Drive",.3):k.onGround?k.landT<.3&&k.speed<2.5?Bi("Land",.06):t?Bi(qw(),.25):k.speed>.6?(f.health<35||f.suit<6)&&k.speed<4?(Bi("Stagger",.3),n=_e(k.speed/2.4,.6,1.3)):k.speed>7?(Bi("Run",.2),n=_e(k.speed/Ww,.7,1.25)):(Bi("Walk",.22),n=_e(k.speed/Vw,.45,1.3)):Bi("Idle",.3):k.airT<.12&&k.vy>0&&Ze.name!=="Air"?Bi("JumpStart",.08):Bi("Air",.18),Ze.current&&Ze.current.setEffectiveTimeScale(n),Ze.bones.chest.quaternion.copy(Ze.rest.chest),Ze.bones.head.quaternion.copy(Ze.rest.head),Ze.mixer.update(i),!e&&(ss.position.copy(k.pos),ss.quaternion.copy(k.q).multiply(Ps.setFromAxisAngle(gl,k.face)),(Ze.name==="Walk"||Ze.name==="Run")&&k.onGround)){let o=Ze.current,l=o.getClip().duration,h=o.time%l/l<.5?0:1;h!==Ze.stepPhase&&(Ze.stepPhase=h,Us("footstep",{run:Ze.name==="Run",inside:f.inside,foot:h}))}let s=_e(k.pitch+.1,-.7,.6);if(!e&&!t&&!f.over){let o=_e(-fo(k.face),-1.1,1.1);Ze.bones.chest&&Ze.bones.chest.rotateX(-s*.18),Ze.bones.head&&(Ze.bones.head.rotateX(-s*.4),Ze.bones.head.rotateY(o*.55))}let r=1-_e(ce.engine.sky.day*3,0,1),a=e||f.inside?0:Math.max(r,f.storm.i>.6?.5:0);Ze.lamp.intensity=it(Ze.lamp.intensity,a*42,Jt(.25,i));for(let o of Ze.lampMats)o.emissiveIntensity=.15+a*5}var fo=i=>(i=(i+Math.PI)%(Math.PI*2),i<0&&(i+=Math.PI*2),i-Math.PI),Ft={init:!1,pivot:new C,dist:5.6,fov:60,land:0},um=new C,aa=new C,dm=new C,fm=new C,Ku=new dt;function Ju(i){Il(k.q,Ge.yaw),k.face=fo(k.face-Ge.yaw),k.pitch=_e(k.pitch+Ge.pitch*(Ge.invertY?-1:1),f.firstPerson?-1.45:-1.2,f.firstPerson?1.45:.85),Ge.yaw=0,Ge.pitch=0;let e=zu(),t=Ge.eHeld&&Ui.active&&f.holdT>.02,n=Hu()&&f.suit>1&&!t,s=f.health<35||f.suit<6,r=n?Le.runSpeed:Le.walkSpeed;s&&(r*=.55);let a=0,o=0;if(e.mag>.12&&!t){let m=Math.hypot(e.mx,e.mz);a=e.mx/m*r*e.mag,o=e.mz/m*r*e.mag}k.slope=pu(k.pos,1.3,um),dm.set(0,0,-1).applyQuaternion(k.q),fm.set(1,0,0).applyQuaternion(k.q);let l=um.dot(fm),c=-um.dot(dm);if(k.onGround&&k.slope>.05){let m=a*l+o*c,y=Math.hypot(a,o);if(y>.01){let M=-m/y;if(M>0){let x=_e(1-k.slope*M*1.05,0,1),S=(1-(k.slope>.95?0:x))*-m;a+=l*S,o+=c*S}else{let x=1+Math.min(.18,k.slope*.25)*-M;a*=x,o*=x}}if(k.slope>1.1){let M=Math.min(7,(k.slope-1)*9);a+=l*M,o+=c*M}}let h=k.onGround?Math.hypot(a,o)>.1?26:34:5,u=a-k.vx,d=o-k.vz,p=Math.hypot(u,d);if(p>1e-5){let m=Math.min(p,h*i);k.vx+=u/p*m,k.vz+=d/p*m}k.speed=Math.hypot(k.vx,k.vz);let g=k.pos.length();if(k.speed>.01){let m=k.speed*i;Qr(k.q,k.vx/k.speed,k.vz/k.speed,m,12e3+k.alt),k.bob+=i*(k.speed>7?11:7)*Math.min(1,k.speed/5),f.stats.walked+=m;let y=Math.atan2(-k.vx,-k.vz),M=fo(y-k.face);k.face=fo(k.face+M*Jt(.07,i)*Math.min(1,k.speed/1.5))}if(t&&Ui.active){let m=Ui.active.pos&&Ui.active.pos();if(m&&st(m,k.pos)>.4){aa.copy(m).sub(k.pos);let y=Math.atan2(-aa.dot(fm),aa.dot(dm));k.face=fo(k.face+fo(y-k.face)*Jt(.1,i))}}Lu(k.q,k.radius)&&(k.vx*=.6,k.vz*=.6),k.q.normalize(),k.up.set(0,1,0).applyQuaternion(k.q);let v=St(k.up);if(k.onGround){let m=g-v;m>.45+6*i?(k.onGround=!1,k.alt=m,k.vy=0,k.airT=0):k.alt=0,k.onGround&&(Ge.keys[" "]||gb())&&!t&&k.slope<1.1&&(k.vy=Le.jumpV,k.onGround=!1,k.airT=0,k.alt=.001,Us("jump",{}))}else if(k.alt=Math.max(0,g-v),k.vy-=Le.gravity*i,k.alt+=k.vy*i,k.airT+=i,k.alt<=0){let m=-k.vy;if(k.alt=0,k.vy=0,k.onGround=!0,k.landT=0,Ft.land=Math.min(1,m/7),Us("land",{speed:m,inside:f.inside}),m>9.5){let y=(m-9.5)*7;f.health=Math.max(0,f.health-y),f.shake=Math.max(f.shake,.8),Us("hurt",{amount:y,cause:"fall"})}}if(k.landT+=i,ns(),$w(i,e.mag>.12&&n),R.hab&&(Fs(R.hab,k.pos,Ce),f.inside=Math.hypot(Ce.x,Ce.z)<Wn-.3&&Ce.y<6,f.inAirlock=!f.inside&&Math.abs(Ce.x)<1.3&&Ce.z>Wn-.3&&Ce.z<Yu),!f.inside){for(let m of R.builtMeshes)if(m.kind==="greenhouse"&&st(k.pos,m.group.position)<4){f.inside=!0;break}}}function Xw(i,e){return i>-6.6&&i<-1.9&&e>-4.5&&e<2.9?2.08:Math.hypot(i,e)>6.2?2.6:3.3}var jw={group:null,inside:(i,e)=>Math.hypot(i,e)<Wn-.45,ceiling:Xw},Kw={group:null,inside:i=>Math.abs(i)<.95,ceiling:()=>2.2},yb={group:null,inside:(i,e)=>Math.hypot(i,e)<Ni.wall-.4||Math.abs(i)<Ni.doorHalf-.2&&e>0&&e<Ni.portalEnd+3,ceiling:(i,e)=>.3+Math.sqrt(Math.max(.2,16-i*i-e*e))};function Yw(){if(R.hab&&(f.inside||f.inAirlock)&&(Fs(R.hab,k.pos,Ce),Math.hypot(Ce.x,Ce.z)<Yu+1)){let i=f.inAirlock?Kw:jw;return i.group=R.hab,i}if(f.inside){for(let i of R.builtMeshes)if(i.kind==="greenhouse"&&st(k.pos,i.group.position)<4.2)return yb.group=i.group,yb}return null}function Jw(i,e){if(e)return Fs(e.group,i,Ce),e.inside(Ce.x,Ce.z);if(R.hab){Fs(R.hab,i,Ce);let t=Math.hypot(Ce.x,Ce.z);if(Ce.y<6.2&&(t<Wn+.7||Math.abs(Ce.x)<_b+.5&&Ce.z>0&&Ce.z<Yu+.5&&Ce.y<3.6))return!1}for(let t of R.builtMeshes)if(t.kind==="greenhouse"&&(Fs(t.group,i,Ce),Ce.y<5&&Math.hypot(Ce.x,Ce.z)<4.45))return!1;return!0}function $w(i,e){let t=ce.engine.camera,n=Ft.land*.22;if(Ft.land=Math.max(0,Ft.land-i*4),f.firstPerson){let r=k.speed>.5&&k.onGround?Math.sin(k.bob)*.045:0;t.position.copy(k.pos).addScaledVector(k.up,k.eyeH+r-n),t.quaternion.copy(k.q).multiply(Ps.setFromAxisAngle(vl,k.pitch)),Ft.init=!1}else{let r=f.inside||f.inAirlock;aa.copy(k.pos).addScaledVector(k.up,(r?1.5:1.62)-n),!Ft.init||Ft.pivot.distanceTo(aa)>6?(Ft.pivot.copy(aa),Ft.init=!0):Ft.pivot.lerp(aa,Jt(.045,i)),Ku.copy(k.q).multiply(Ps.setFromAxisAngle(vl,k.pitch));let a=r?3.1:5.4+Math.min(1.2,k.speed*.08),o=r?.2:.42,l=Yw(),c=a;for(let u=0;u<7&&(t.position.copy(Ft.pivot).add(Pe.set(.55*Math.min(1,c/3),o,c).applyQuaternion(Ku)),!(t.position.length()>=St(t.position)+.35&&Jw(t.position,l)));u++)c*=.72;if(Ft.dist=c<Ft.dist?c:it(Ft.dist,c,Jt(.25,i)),t.position.copy(Ft.pivot).add(Pe.set(.55*Math.min(1,Ft.dist/3),o,Ft.dist).applyQuaternion(Ku)),l){Fs(l.group,t.position,Ce);let u=l.ceiling(Ce.x,Ce.z);Ce.y>u?Ft.duck=it(Ft.duck||0,Ce.y-u,Jt(.08,i)):Ft.duck=it(Ft.duck||0,0,Jt(.15,i)),Ft.duck>.005&&t.position.addScaledVector(k.up,-Ft.duck)}else Ft.duck=0;let h=St(t.position)+.3;t.position.length()<h&&t.position.normalize().multiplyScalar(h),t.quaternion.copy(Ku)}f.shake>0&&(f.shake=Math.max(0,f.shake-i*1.6),Ge.reducedMotion||t.position.addScaledVector(Pe.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.4));let s=ce.engine.baseFov+(e?7:0);t.fov=it(t.fov,s,Jt(.18,i)),t.updateProjectionMatrix()}function ab(){return uu.copy(k.pos).normalize()}var br=new C,vr=new C,Gl=new C,pm=new dt,wb=new C,mm=0,gm=0,vm=0;function bm(i){return i.normalize().multiplyScalar(St(i))}function Tb(){Eu("footstep",i=>{f.inside||f.inAirlock||f.mode!=="walk"||(pm.copy(k.q).multiply(new dt().setFromAxisAngle(gl,k.face)),vr.set(0,0,-1).applyQuaternion(pm),Gl.set(1,0,0).applyQuaternion(pm),br.copy(k.pos).addScaledVector(Gl,i.foot?.12:-.12),bm(br),ce.vfx.mark("boot",br,vr),ce.vfx.puff(br,{count:i.run?4:2,speed:i.run?.9:.5,up:.35,spread:.12,size:i.run?.34:.24,life:1.3,dir:wb.copy(vr).multiplyScalar(-.5)}))}),Eu("land",i=>{f.inside||f.inAirlock||ce.vfx.puff(k.pos,{count:Math.min(16,5+Math.round(i.speed*2)),speed:1.2+i.speed*.25,up:.5,spread:.25,size:.5,life:1.9})}),Eu("dust",i=>{ce.vfx.puff(i.pos,i)})}function xm(i){if(f.mode==="rover"&&R.rover){let e=Math.abs(mt.speed);if(e>.8){let t=R.rover.group;if(vr.set(0,0,-1).applyQuaternion(mt.q),Gl.set(1,0,0).applyQuaternion(mt.q),mm+=e*i,mm>.85){mm=0;for(let n of[-1.22,1.22])br.copy(t.position).addScaledVector(Gl,n).addScaledVector(vr,-1.9*Math.sign(mt.speed)),ce.vfx.mark("tyre",bm(br),vr)}for(gm+=i*Math.min(40,6+e*1.2);gm>1;){gm-=1;let n=Math.random()<.5?-1.22:1.22;br.copy(t.position).addScaledVector(Gl,n).addScaledVector(vr,-2.2*Math.sign(mt.speed)),ce.vfx.puff(bm(br),{count:1,speed:.6+e*.04,up:.5+e*.03,spread:.3,size:.6+e*.03,life:2.2+e*.03,dir:wb.copy(vr).multiplyScalar(-e*.18*Math.sign(mt.speed))})}}}if(f.mode==="cutscene"&&R.mavFlame&&R.mavFlame.visible&&R.mavRocket){let e=R.mavRocket.position.y-(R.mavRocketY||0);vm+=i,e<60&&vm>.03&&(vm=0,ce.vfx.puff(R.mav.position,{count:6,speed:9+Math.random()*6,up:1.5,spread:2.5,size:2.6,life:4.5,tone:.5}))}}function Zw(){let i=new URLSearchParams(location.search).get("q");if(i)return i;try{let t=localStorage.getItem("stranded2-quality");if(t)return t}catch{}return Ge.isTouch&&Math.min(screen.width,screen.height)<900?"low":"high"}function $u(i,e){Q.panel.innerHTML=`<h1>STRANDED II</h1><h2>${e||"Loading"}</h2><div style="height:6px;border:1px solid rgba(242,216,184,.4)"><div style="height:100%;width:${Math.round(i*100)}%;background:#ffb45e"></div></div>`,Q.overlay.style.display="flex"}async function Qw(){$u(0,"Receiving orbital survey");let i=ce.engine=new tu(Is,Zw());ce.world=new Xt,ce.world.name="world",i.scene.add(ce.world);let e=await Q0($u,{maxColorFace:i.q.scale<.7?512:1024});ce.planet=e.planet;let t=sv(e.albedoCube,{fine:i.q.fine});ce.terrainMaterial=t,ce.outdoor=new Xt,i.scene.add(ce.outdoor),ce.terrain=new ou({planet:e.planet,heightData:e.heightData,parent:ce.outdoor,material:t,workerUrl:lr("terrain-worker.js"),grid:i.q.grid,maxLevel:i.q.maxLevel,split:i.q.split,workers:i.q.workers,shadowLevel:i.q.maxLevel-i.q.terrainShadowLevels+1}),ce.rocks=new wu(ce.outdoor,ce.terrain,{density:i.q.rocks,shadowRange:i.q.scale>=.7?i.q.shadowRange:0,albedoCube:e.albedoCube}),ce.vfx=new Tu(i.scene,{air:i.q.scale<.7?700:1600,puffs:i.q.scale<.7?300:600,sheets:i.q.scale<.7?18:36}),Tb();let n=new Image;n.onload=()=>{ce.mapImage=n},n.src=lr("assets/mars/map.jpg"),await Ev(["astronaut","rover","hab","mav","hermes","farm_plot","solar_panel","uplink_dish","pathfinder","viking","mars3","beagle2","mer","phoenix","insight","msl","ingenuity","zhurong","schiaparelli_wreck","greenhouse","solar_kit","beacon","o2_cache","supply_pod","rtg","debris_a","debris_b","debris_c","regolith_pile","ice_outcrop","uplink_pad"],s=>$u(.9+s*.1,"Unpacking equipment")),Mb(),vb(),zs(),nT(),Ab(0),$u(1,"Building terrain"),await ce.terrain.settle(i.camera.position,15e3),tb(),Mm=Nn(),requestAnimationFrame(Rb),window.__MG.ready=!0,"serviceWorker"in navigator&&location.protocol==="https:"&&navigator.serviceWorker.register(lr("sw.js")).catch(()=>{})}var Mm=0,ym=0,_m=0,po=0,Eb=0;var Vl=0,Zu=0;function Ab(i){let e=ce.engine.camera,t=ce.engine.sunDir;ym+=i*.012,zs();let n=1.02+.16*Math.sin(ym);We.set(-t.z,0,t.x).normalize(),Pe.copy(t).multiplyScalar(Math.cos(n)).addScaledVector(We,Math.sin(n)).multiplyScalar(12e3*2.6),e.position.copy(Pe).setY(12e3*(.45+.25*Math.sin(ym*.6))),Os(Ce.set(0,0,0),We.set(0,1,0))}var mo=null;function eT(i,e){let t=ce.engine;mo&&(t.camera.position.copy(mo.pos),Os(mo.look,mo.up)),t.camera.updateMatrixWorld(),ce.terrain.update(t.camera.position),ce.rocks.update(t.camera.position),Pv(t.camera.position);let n=f.started&&!!R.sealedInside&&!f.over;ce.outdoor.visible=!n,t.update({dt:i,sealed:n,dust:f.started?f.storm.i:0,inside:f.started&&(f.inside||f.inAirlock)&&f.mode==="walk",power:!f.started||f.power>.5,focus:e}),ce.vfx.update(i,t.camera,{storm:f.started?f.storm.i:0,sunIntensity:t.sky.sunIntensity,sunColor:t.sky.sunColor,ambient:t.sky.ambientSky,inside:n||f.started&&f.inside,pixelHeight:t.renderer.domElement.height,camHeight:t.camera.position.length()-St(t.camera.position)}),t.final.uniforms.uDanger.value=R.danger||0,t.final.uniforms.uCold.value=R.cold||0,t.render()}function xr(i){if(!f.started)return Ab(i),null;let e=f.mode==="rover"?R.rover.group.position:k.pos;if(f.over&&f.mode!=="cutscene"||(f.uiOpen||Cn())&&!f.sleeping)return e;if(f.mode==="cutscene")return R.launchAnim&&R.launchAnim(i),xm(i),zs(),R.mav.position;f.sleeping||(nm(i),ku(i,!1),f.mode==="walk"?Ju(i):f.mode==="rover"&&Vv(i),Sb(i),Hv(i),lb(i),tT(),xm(i)),we.wind((f.inside?.05:.16)+f.storm.i*.65+(f.breach.active&&f.inside?.4:0)),po+=i,R.beaconMats&&es(R.beaconMats,Math.sin(po*5)>0?1:.05),R.mavStrobeMats&&es(R.mavStrobeMats,Math.sin(po*7)>.6?1.6:.04);let t=Math.sin(po*6)>.7?1.8:.03;for(let n of R.pods)n.strobe&&!n.taken&&n.group.visible&&es(n.strobe,t);for(let n of R.builtMeshes)n.lamp&&n.group.visible&&es(n.lamp,.25+1.5*Math.max(0,Math.sin(po*2.2))**6);return R.padLampMats&&es(R.padLampMats,f.pf.loaded&&!f.pf.connected?.55+.45*Math.sin(po*4):.2),Iv(i),zs(),$v(),Jv(),Yv(),Q.mapScreen.style.display==="block"&&(_m+=i,_m>.7&&(_m=0,om())),e}var Ws=null;function Rb(){requestAnimationFrame(Rb);let i=Nn(),e=i-Mm,t=Math.min(e,.05);Mm=i,Vl+=e,Zu++,Vl>1&&(window.__MG.fixedResolution||ce.engine.adaptResolution(Vl/Zu*1e3,1e3/55),window.__MG.fps=Zu/Vl,Vl=0,Zu=0),window.__MG.paused||(Ws=xr(t)),eT(window.__MG.paused?0:t,Ws)}function tT(){if(!f.flags.pfRevealed||f.pf.found||f.pf.loaded||f.pf.connected)return;let i=st(k.pos,R.pathfinder.position);if(i>90)return;let e=_e(i/60,.12,1.4);Nn()-Eb>e&&(Eb=Nn(),we.beep(1200,.04,"square",.05)),i<10&&!f.pf.found&&(f.pf.found=!0,Ue("Signal source dead ahead. There you are."))}function nT(){window.__MG={ctx:ce,S:f,World:R,player:k,roverF:mt,BAL:Le,DIFFICULTIES:ei,interactables:Pu,input:Ge,interaction:Ui,llToVec:Bt,surfaceAt:St,groundDist:st,applyRates:ku,advanceTime:nm,newSol:Bu,sleepToDawn:Bl,checkpoint:is,restoreCheckpoint:Fu,serializeState:Du,applyState:Ll,saveGame:ks,syncAllVisuals:Pn,initPlayerAt:gr,initRoverAt:Cl,newGame:Nl,continueGame:Zp,checkAchievements:Oi,buildDeployable:ao,dropSupplyPod:Ml,ready:!1,fps:0,paused:!1,tick(i,e=1){for(let t=0;t<e;t++)Ws=xr(i)},fixedResolution:new URLSearchParams(location.search).has("fixed"),async start(i,e,t="survival"){if(i!==void 0){let n=Math.random,s=[(i/52+1)/2,e/360];Math.random=()=>s.length?s.shift():n();try{Nl(t)}finally{Math.random=n}}else Nl(t);return Q.overlay.style.display="none",f.uiOpen=!1,await this.settle(),{lat:R.spawn.lat,lon:R.spawn.lon}},skipIntro(){Object.assign(f.flags,{coldOpen:!1,suitSealed:!0,didMath:!0}),f.checkedSystems={oxy:!0,rec:!0},f.suit=100},async tp(i,e,t=0){return gr(Bt(i,e),t),f.mode==="walk"&&Ju(.001),this.settle()},async tpHab(i,e,t=0){let n=R.hab.position.clone().normalize(),s=new C(-n.z,0,n.x).normalize(),r=new C().crossVectors(n,s);return gr(n.addScaledVector(s,i/12e3).addScaledVector(r,e/12e3).normalize(),t),f.mode==="walk"&&Ju(.001),this.settle()},setLocalTime(i){let e=Pe.copy(k.pos).normalize(),t=(Math.atan2(-e.z,e.x)*180/Math.PI+360)%360;f.tod=((i/24.66-.5-t/360)%1+1)%1,zs()},tpLocal(i,e,t=0){let n=tn(R.hab,i,0,e,new C);gr(n.normalize(),t),Ws=xr(.001)},tpNear(i,e=1.5){let t=i.clone().normalize(),n=new C(-t.z,0,t.x).normalize(),s=new C().crossVectors(t,n);gr(t.addScaledVector(s,e/12e3).normalize(),0),Ws=xr(.001)},tpAround(i,e=6,t=0){let n=t*Math.PI/180,s=i.clone().normalize(),r=new C(-s.z,0,s.x).normalize(),a=new C().crossVectors(s,r);gr(s.addScaledVector(a,Math.cos(n)*e/12e3).addScaledVector(r,Math.sin(n)*e/12e3).normalize(),n),Ws=xr(.001)},photo(i,e=6,t=0,n=1.7,s=.9){if(!i){mo=null;return}let r=t*Math.PI/180,a=i.clone().normalize(),o=new C(-a.z,0,a.x).normalize(),l=new C().crossVectors(a,o),c=a.clone().addScaledVector(l,Math.cos(r)*e/12e3).addScaledVector(o,Math.sin(r)*e/12e3).normalize();mo={pos:c.clone().multiplyScalar(St(c)+n),look:a.clone().multiplyScalar(St(a)+s),up:a},ce.engine.snapLight=3},faceSun(){let i=Pe.copy(k.pos).normalize().clone(),e=ce.engine.sunDir,t=new C(-i.z,0,i.x).normalize(),n=new C().crossVectors(i,t);gr(i,Math.atan2(e.dot(t),e.dot(n))-Math.PI),Ws=xr(.001)},at(i,e){return tn(R.hab,i,0,e,new C)},roverTo(i,e=6){let t=i.clone().normalize(),n=new C(-t.z,0,t.x).normalize(),s=new C().crossVectors(t,n);Cl(t.addScaledVector(s,-e/12e3).normalize(),0)},hold(i){Ge.eHeld=!0;for(let e=0;e<Math.ceil(i/.05);e++)Ws=xr(.05);Ge.eHeld=!1,Ws=xr(.05)},setStorm(i){f.storm.i=i,f.storm.hold=i},look(i){k.pitch=i,ce.engine.snapLight=3},async settle(){return ce.engine.camera.updateMatrixWorld(),ce.terrain.settle(ce.engine.camera.position,2e4)},info(){return{fps:+this.fps.toFixed(1),...ce.engine.info(),...ce.terrain.stats(),rocks:ce.rocks.counts}}}}Qw().catch(i=>{console.error(i),yi({title:"SOMETHING BROKE",body:`The game could not start.

${String(i&&i.message||i)}

Reload the page to try again.`,buttons:[]})});
