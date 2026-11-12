var Ym=0,xd=1,Jm=2;var Vo=1,Dc=2,Ia=3,Oi=0,nn=1,yn=2,gs=0,Xs=1,Wo=2,yd=3,_d=4,$m=5;var Lr=100,Zm=101,Qm=102,eg=103,tg=104,ng=200,ig=201,sg=202,rg=203,Sd=204,Md=205,ag=206,og=207,lg=208,cg=209,hg=210,ug=211,dg=212,fg=213,pg=214,ac=0,oc=1,lc=2,fa=3,cc=4,hc=5,uc=6,dc=7,wd=0,mg=1,gg=2,oi=0,Td=1,Ed=2,Ad=3,Rd=4,Cd=5,Pd=6,Id=7,hd="attached",vg="detached",Ld=300,Dr=301,La=302,Fc=303,Nc=304,Fi=1e3,ri=1001,pa=1002,Xt=1003,Uc=1004;var Fr=1005;var Ht=1006,Da=1007;var _n=1008;var kn=1009,Dd=1010,Fd=1011,Fa=1012,Oc=1013,Mi=1014,jn=1015,sn=1016,kc=1017,Bc=1018,Nr=1020,Nd=35902,Ud=35899,Od=1021,kd=1022,Bn=1023,ss=1026,vs=1027,zc=1028,Hc=1029,js=1030,Gc=1031;var Vc=1033,qo=33776,Xo=33777,jo=33778,Ko=33779,Wc=35840,qc=35841,Xc=35842,jc=35843,Kc=36196,Yc=37492,Jc=37496,$c=37488,Zc=37489,Yo=37490,Qc=37491,eh=37808,th=37809,nh=37810,ih=37811,sh=37812,rh=37813,ah=37814,oh=37815,lh=37816,ch=37817,hh=37818,uh=37819,dh=37820,fh=37821,ph=36492,mh=36494,gh=36495,vh=36283,bh=36284,Jo=36285,xh=36286,yh=2200,bg=2201,xg=2202,xr=2300,yr=2301,sc=2302,ud=2303,gr=2400,vr=2401,yo=2402,_h=2500,yg=2501,Bd=0,$o=1,Na=2,_g=3200;var Sh=0,Sg=1,li="",zt="srgb",Pn="srgb-linear",_o="linear",yt="srgb";var rc=7680;var Mg=519,wg=512,Tg=513,Eg=514,zd=515,Ag=516,Rg=517,Hd=518,Gd=519,Vd=35044,Ua=35048;var Wd="300 es",ai=2e3,ma=2001;function tb(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function nb(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function ga(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Cg(){let i=ga("canvas");return i.style.display="block",i}var cm={},va=null;function So(...i){let e="THREE."+i.shift();va?va("log",e,...i):console.log(e,...i)}function Pg(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function ke(...i){i=Pg(i);let e="THREE."+i.shift();if(va)va("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ke(...i){i=Pg(i);let e="THREE."+i.shift();if(va)va("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function br(...i){let e=i.join(" ");e in cm||(cm[e]=!0,ke(...i))}function Ig(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Lg={[ac]:ac,[lc]:uc,[cc]:cc,[fa]:hc,[oc]:oc,[uc]:lc,[dc]:dc,[hc]:fa},Si=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},vn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],hm=1234567,bo=Math.PI/180,_r=180/Math.PI;function ki(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(vn[i&255]+vn[i>>8&255]+vn[i>>16&255]+vn[i>>24&255]+"-"+vn[e&255]+vn[e>>8&255]+"-"+vn[e>>16&15|64]+vn[e>>24&255]+"-"+vn[t&63|128]+vn[t>>8&255]+"-"+vn[t>>16&255]+vn[t>>24&255]+vn[n&255]+vn[n>>8&255]+vn[n>>16&255]+vn[n>>24&255]).toLowerCase()}function ct(i,e,t){return Math.max(e,Math.min(t,i))}function qd(i,e){return(i%e+e)%e}function ib(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function sb(i,e,t){return i!==e?(t-i)/(e-i):0}function xo(i,e,t){return(1-t)*i+t*e}function rb(i,e,t,n){return xo(i,e,1-Math.exp(-t*n))}function ab(i,e=1){return e-Math.abs(qd(i,e*2)-e)}function ob(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function lb(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function cb(i,e){return i+Math.floor(Math.random()*(e-i+1))}function hb(i,e){return i+Math.random()*(e-i)}function ub(i){return i*(.5-Math.random())}function db(i){i!==void 0&&(hm=i);let e=hm+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function fb(i){return i*bo}function pb(i){return i*_r}function mb(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function gb(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Xd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function vb(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),p=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*u,l*d,o*c);break;case"YZY":i.set(l*d,o*h,l*u,o*c);break;case"ZXZ":i.set(l*u,l*d,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*h,o*c);break;default:ke("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Mh(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function jd(i,e){if(e.constructor===Float32Array)return i;let t=Mh(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Kd(i,e){if(e.constructor===Float32Array)return i;let t=Mh(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var wh={DEG2RAD:bo,RAD2DEG:_r,generateUUID:ki,clamp:ct,euclideanModulo:qd,mapLinear:ib,inverseLerp:sb,lerp:xo,damp:rb,pingpong:ab,smoothstep:ob,smootherstep:lb,randInt:cb,randFloat:hb,randFloatSpread:ub,seededRandom:db,degToRad:fb,radToDeg:pb,isPowerOfTwo:mb,ceilPowerOfTwo:gb,floorPowerOfTwo:Xd,setQuaternionFromProperEuler:vb,normalize:Kd,denormalize:jd},Qd=class Qd{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Qd.prototype.isVector2=!0;var Be=Qd,ht=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(u!==_||l!==d||c!==p||h!==g){let v=l*d+c*p+h*g+u*_;v<0&&(d=-d,p=-p,g=-g,_=-_,v=-v);let m=1-o;if(v<.9995){let x=Math.acos(v),S=Math.sin(x);m=Math.sin(m*x)/S,o=Math.sin(o*x)/S,l=l*m+d*o,c=c*m+p*o,h=h*m+g*o,u=u*m+_*o}else{l=l*m+d*o,c=c*m+p*o,h=h*m+g*o,u=u*m+_*o;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*u+l*p-c*d,e[t+1]=l*g+h*d+c*u-o*p,e[t+2]=c*g+h*p+o*d-l*u,e[t+3]=h*g-o*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:ke("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},ef=class ef{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(um.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(um.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return zu.copy(this).projectOnVector(e),this.sub(zu)}reflect(e){return this.sub(zu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ef.prototype.isVector3=!0;var C=ef,zu=new C,um=new ht,tf=class tf{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],_=s[0],v=s[3],m=s[6],x=s[1],S=s[4],y=s[7],R=s[2],M=s[5],b=s[8];return r[0]=a*_+o*x+l*R,r[3]=a*v+o*S+l*M,r[6]=a*m+o*y+l*b,r[1]=c*_+h*x+u*R,r[4]=c*v+h*S+u*M,r[7]=c*m+h*y+u*b,r[2]=d*_+p*x+g*R,r[5]=d*v+p*S+g*M,r[8]=d*m+p*y+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,p=c*r-a*l,g=t*u+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return br("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Hu.makeScale(e,t)),this}rotate(e){return br("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Hu.makeRotation(-e)),this}translate(e,t){return br("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Hu.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};tf.prototype.isMatrix3=!0;var Ye=tf,Hu=new Ye,dm=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fm=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function bb(){let i={enabled:!0,workingColorSpace:Pn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===yt&&(s.r=is(s.r),s.g=is(s.g),s.b=is(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===yt&&(s.r=da(s.r),s.g=da(s.g),s.b=da(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===li?_o:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Pn]:{primaries:e,whitePoint:n,transfer:_o,toXYZ:dm,fromXYZ:fm,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:zt},outputColorSpaceConfig:{drawingBufferColorSpace:zt}},[zt]:{primaries:e,whitePoint:n,transfer:yt,toXYZ:dm,fromXYZ:fm,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:zt}}}),i}var at=bb();function is(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function da(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Zr,fc=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Zr===void 0&&(Zr=ga("canvas")),Zr.width=e.width,Zr.height=e.height;let s=Zr.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Zr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ga("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=is(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(is(t[n]/255)*255):t[n]=is(t[n]);return{data:t,width:e.width,height:e.height}}else return ke("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},xb=0,ba=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:xb++}),this.uuid=ki(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Gu(s[a].image)):r.push(Gu(s[a]))}else r=Gu(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Gu(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?fc.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(ke("Texture: Unable to serialize Texture."),{})}var yb=0,Vu=new C,tn=class i extends Si{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ri,s=ri,r=Ht,a=_n,o=Bn,l=kn,c=i.DEFAULT_ANISOTROPY,h=li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:yb++}),this.uuid=ki(),this.name="",this.source=new ba(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Be(0,0),this.repeat=new Be(1,1),this.center=new Be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Vu).x}get height(){return this.source.getSize(Vu).y}get depth(){return this.source.getSize(Vu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ke(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ke(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ld)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fi:e.x=e.x-Math.floor(e.x);break;case ri:e.x=e.x<0?0:1;break;case pa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Fi:e.y=e.y-Math.floor(e.y);break;case ri:e.y=e.y<0?0:1;break;case pa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};tn.DEFAULT_IMAGE=null;tn.DEFAULT_MAPPING=Ld;tn.DEFAULT_ANISOTROPY=1;var nf=class nf{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],_=l[2],v=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-v)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+v)<.1&&Math.abs(c+p+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,y=(p+1)/2,R=(m+1)/2,M=(h+d)/4,b=(u+_)/4,w=(g+v)/4;return S>y&&S>R?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=M/n,r=b/n):y>R?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=M/s,r=w/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=b/r,s=w/r),this.set(n,s,r,t),this}let x=Math.sqrt((v-g)*(v-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(v-g)/x,this.y=(u-_)/x,this.z=(d-h)/x,this.w=Math.acos((c+p+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this.w=ct(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this.w=ct(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};nf.prototype.isVector4=!0;var St=nf,pc=class extends Si{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ht,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new St(0,0,e,t),this.scissorTest=!1,this.viewport=new St(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new tn({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ht,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ba(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},jt=class extends pc{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Mo=class extends tn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var mc=class extends tn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Lc=class Lc{constructor(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v)}set(e,t,n,s,r,a,o,l,c,h,u,d,p,g,_,v){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=g,m[11]=_,m[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lc().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Qr.setFromMatrixColumn(e,0).length(),r=1/Qr.setFromMatrixColumn(e,1).length(),a=1/Qr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d+_*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,p=a*u,g=o*h,_=o*u;t[0]=l*h,t[4]=g*c-p,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=g*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*u+g,t[10]=d-_*u}else if(e.order==="XZY"){let d=a*l,p=a*c,g=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_b,e,Sb)}lookAt(e,t,n){let s=this.elements;return Vn.subVectors(e,t),Vn.lengthSq()===0&&(Vn.z=1),Vn.normalize(),Ns.crossVectors(n,Vn),Ns.lengthSq()===0&&(Math.abs(n.z)===1?Vn.x+=1e-4:Vn.z+=1e-4,Vn.normalize(),Ns.crossVectors(n,Vn)),Ns.normalize(),Dl.crossVectors(Vn,Ns),s[0]=Ns.x,s[4]=Dl.x,s[8]=Vn.x,s[1]=Ns.y,s[5]=Dl.y,s[9]=Vn.y,s[2]=Ns.z,s[6]=Dl.z,s[10]=Vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],_=n[6],v=n[10],m=n[14],x=n[3],S=n[7],y=n[11],R=n[15],M=s[0],b=s[4],w=s[8],L=s[12],I=s[1],N=s[5],k=s[9],V=s[13],D=s[2],q=s[6],K=s[10],z=s[14],se=s[3],X=s[7],Y=s[11],ee=s[15];return r[0]=a*M+o*I+l*D+c*se,r[4]=a*b+o*N+l*q+c*X,r[8]=a*w+o*k+l*K+c*Y,r[12]=a*L+o*V+l*z+c*ee,r[1]=h*M+u*I+d*D+p*se,r[5]=h*b+u*N+d*q+p*X,r[9]=h*w+u*k+d*K+p*Y,r[13]=h*L+u*V+d*z+p*ee,r[2]=g*M+_*I+v*D+m*se,r[6]=g*b+_*N+v*q+m*X,r[10]=g*w+_*k+v*K+m*Y,r[14]=g*L+_*V+v*z+m*ee,r[3]=x*M+S*I+y*D+R*se,r[7]=x*b+S*N+y*q+R*X,r[11]=x*w+S*k+y*K+R*Y,r[15]=x*L+S*V+y*z+R*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],_=e[7],v=e[11],m=e[15],x=l*p-c*d,S=o*p-c*u,y=o*d-l*u,R=a*p-c*h,M=a*d-l*h,b=a*u-o*h;return t*(_*x-v*S+m*y)-n*(g*x-v*R+m*M)+s*(g*S-_*R+m*b)-r*(g*y-_*M+v*b)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],_=e[13],v=e[14],m=e[15],x=t*o-n*a,S=t*l-s*a,y=t*c-r*a,R=n*l-s*o,M=n*c-r*o,b=s*c-r*l,w=h*_-u*g,L=h*v-d*g,I=h*m-p*g,N=u*v-d*_,k=u*m-p*_,V=d*m-p*v,D=x*V-S*k+y*N+R*I-M*L+b*w;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let q=1/D;return e[0]=(o*V-l*k+c*N)*q,e[1]=(s*k-n*V-r*N)*q,e[2]=(_*b-v*M+m*R)*q,e[3]=(d*M-u*b-p*R)*q,e[4]=(l*I-a*V-c*L)*q,e[5]=(t*V-s*I+r*L)*q,e[6]=(v*y-g*b-m*S)*q,e[7]=(h*b-d*y+p*S)*q,e[8]=(a*k-o*I+c*w)*q,e[9]=(n*I-t*k-r*w)*q,e[10]=(g*M-_*y+m*x)*q,e[11]=(u*y-h*M-p*x)*q,e[12]=(o*L-a*N-l*w)*q,e[13]=(t*N-n*L+s*w)*q,e[14]=(_*S-g*R-v*x)*q,e[15]=(h*R-u*S+d*x)*q,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,p=r*h,g=r*u,_=a*h,v=a*u,m=o*u,x=l*c,S=l*h,y=l*u,R=n.x,M=n.y,b=n.z;return s[0]=(1-(_+m))*R,s[1]=(p+y)*R,s[2]=(g-S)*R,s[3]=0,s[4]=(p-y)*M,s[5]=(1-(d+m))*M,s[6]=(v+x)*M,s[7]=0,s[8]=(g+S)*b,s[9]=(v-x)*b,s[10]=(1-(d+_))*b,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Qr.set(s[0],s[1],s[2]).length(),o=Qr.set(s[4],s[5],s[6]).length(),l=Qr.set(s[8],s[9],s[10]).length();r<0&&(a=-a),bi.copy(this);let c=1/a,h=1/o,u=1/l;return bi.elements[0]*=c,bi.elements[1]*=c,bi.elements[2]*=c,bi.elements[4]*=h,bi.elements[5]*=h,bi.elements[6]*=h,bi.elements[8]*=u,bi.elements[9]*=u,bi.elements[10]*=u,t.setFromRotationMatrix(bi),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=ai,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),p=(n+s)/(n-s),g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===ai)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===ma)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=ai,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),p=-(n+s)/(n-s),g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===ai)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===ma)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Lc.prototype.isMatrix4=!0;var qe=Lc,Qr=new C,bi=new qe,_b=new C(0,0,0),Sb=new C(1,1,1),Ns=new C,Dl=new C,Vn=new C,pm=new qe,mm=new ht,rs=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ct(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ct(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ct(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:ke("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return pm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(pm,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return mm.setFromEuler(this),this.setFromQuaternion(mm,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};rs.DEFAULT_ORDER="XYZ";var wo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Mb=0,gm=new C,ea=new ht,$i=new qe,Fl=new C,lo=new C,wb=new C,Tb=new ht,vm=new C(1,0,0),bm=new C(0,1,0),xm=new C(0,0,1),ym={type:"added"},Eb={type:"removed"},ta={type:"childadded",child:null},Wu={type:"childremoved",child:null},Tt=class i extends Si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Mb++}),this.uuid=ki(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new C,t=new rs,n=new ht,s=new C(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new qe},normalMatrix:{value:new Ye}}),this.matrix=new qe,this.matrixWorld=new qe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ea.setFromAxisAngle(e,t),this.quaternion.multiply(ea),this}rotateOnWorldAxis(e,t){return ea.setFromAxisAngle(e,t),this.quaternion.premultiply(ea),this}rotateX(e){return this.rotateOnAxis(vm,e)}rotateY(e){return this.rotateOnAxis(bm,e)}rotateZ(e){return this.rotateOnAxis(xm,e)}translateOnAxis(e,t){return gm.copy(e).applyQuaternion(this.quaternion),this.position.add(gm.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vm,e)}translateY(e){return this.translateOnAxis(bm,e)}translateZ(e){return this.translateOnAxis(xm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($i.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Fl.copy(e):Fl.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),lo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$i.lookAt(lo,Fl,this.up):$i.lookAt(Fl,lo,this.up),this.quaternion.setFromRotationMatrix($i),s&&($i.extractRotation(s.matrixWorld),ea.setFromRotationMatrix($i),this.quaternion.premultiply(ea.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ym),ta.child=e,this.dispatchEvent(ta),ta.child=null):Ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Eb),Wu.child=e,this.dispatchEvent(Wu),Wu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$i.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$i.multiply(e.parent.matrixWorld)),e.applyMatrix4($i),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ym),ta.child=e,this.dispatchEvent(ta),ta.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,e,wb),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,Tb,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Tt.DEFAULT_UP=new C(0,1,0);Tt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var qt=class extends Tt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ab={type:"move"},xa=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let v=t.getJointPose(_,n),m=this._getHandJoint(c,_);v!==null&&(m.matrix.fromArray(v.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=v.radius),m.visible=v!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ab)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new qt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Dg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Us={h:0,s:0,l:0},Nl={h:0,s:0,l:0};function qu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Me=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,at.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=at.workingColorSpace){return this.r=e,this.g=t,this.b=n,at.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=at.workingColorSpace){if(e=qd(e,1),t=ct(t,0,1),n=ct(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=qu(a,r,e+1/3),this.g=qu(a,r,e),this.b=qu(a,r,e-1/3)}return at.colorSpaceToWorking(this,s),this}setStyle(e,t=zt){function n(r){r!==void 0&&parseFloat(r)<1&&ke("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ke("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);ke("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=zt){let n=Dg[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ke("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=is(e.r),this.g=is(e.g),this.b=is(e.b),this}copyLinearToSRGB(e){return this.r=da(e.r),this.g=da(e.g),this.b=da(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=zt){return at.workingToColorSpace(bn.copy(this),e),Math.round(ct(bn.r*255,0,255))*65536+Math.round(ct(bn.g*255,0,255))*256+Math.round(ct(bn.b*255,0,255))}getHexString(e=zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=at.workingColorSpace){at.workingToColorSpace(bn.copy(this),t);let n=bn.r,s=bn.g,r=bn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=at.workingColorSpace){return at.workingToColorSpace(bn.copy(this),t),e.r=bn.r,e.g=bn.g,e.b=bn.b,e}getStyle(e=zt){at.workingToColorSpace(bn.copy(this),e);let t=bn.r,n=bn.g,s=bn.b;return e!==zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Us),this.setHSL(Us.h+e,Us.s+t,Us.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Us),e.getHSL(Nl);let n=xo(Us.h,Nl.h,t),s=xo(Us.s,Nl.s,t),r=xo(Us.l,Nl.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},bn=new Me;Me.NAMES=Dg;var To=class i{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Me(e),this.density=t}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var ya=class extends Tt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rs,this.environmentIntensity=1,this.environmentRotation=new rs,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},xi=new C,Zi=new C,Xu=new C,Qi=new C,na=new C,ia=new C,_m=new C,ju=new C,Ku=new C,Yu=new C,Ju=new St,$u=new St,Zu=new St,Hs=class i{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),xi.subVectors(e,t),s.cross(xi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){xi.subVectors(s,t),Zi.subVectors(n,t),Xu.subVectors(e,t);let a=xi.dot(xi),o=xi.dot(Zi),l=xi.dot(Xu),c=Zi.dot(Zi),h=Zi.dot(Xu),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Qi)===null?!1:Qi.x>=0&&Qi.y>=0&&Qi.x+Qi.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Qi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Qi.x),l.addScaledVector(a,Qi.y),l.addScaledVector(o,Qi.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Ju.setScalar(0),$u.setScalar(0),Zu.setScalar(0),Ju.fromBufferAttribute(e,t),$u.fromBufferAttribute(e,n),Zu.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Ju,r.x),a.addScaledVector($u,r.y),a.addScaledVector(Zu,r.z),a}static isFrontFacing(e,t,n,s){return xi.subVectors(n,t),Zi.subVectors(e,t),xi.cross(Zi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return xi.subVectors(this.c,this.b),Zi.subVectors(this.a,this.b),xi.cross(Zi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;na.subVectors(s,n),ia.subVectors(r,n),ju.subVectors(e,n);let l=na.dot(ju),c=ia.dot(ju);if(l<=0&&c<=0)return t.copy(n);Ku.subVectors(e,s);let h=na.dot(Ku),u=ia.dot(Ku);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0&&l-h>0)return a=l/(l-h),t.copy(n).addScaledVector(na,a);Yu.subVectors(e,r);let p=na.dot(Yu),g=ia.dot(Yu);if(g>=0&&p<=g)return t.copy(r);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(ia,o);let v=h*g-p*u;if(v<=0&&u-h>=0&&p-g>=0)return _m.subVectors(r,s),o=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(_m,o);let m=1/(v+_+d);return a=_*m,o=d*m,t.copy(n).addScaledVector(na,a).addScaledVector(ia,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},qn=class{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(yi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(yi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=yi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,yi):yi.fromBufferAttribute(r,a),yi.applyMatrix4(e.matrixWorld),this.expandByPoint(yi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ul.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ul.copy(n.boundingBox)),Ul.applyMatrix4(e.matrixWorld),this.union(Ul)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yi),yi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(co),Ol.subVectors(this.max,co),sa.subVectors(e.a,co),ra.subVectors(e.b,co),aa.subVectors(e.c,co),Os.subVectors(ra,sa),ks.subVectors(aa,ra),dr.subVectors(sa,aa);let t=[0,-Os.z,Os.y,0,-ks.z,ks.y,0,-dr.z,dr.y,Os.z,0,-Os.x,ks.z,0,-ks.x,dr.z,0,-dr.x,-Os.y,Os.x,0,-ks.y,ks.x,0,-dr.y,dr.x,0];return!Qu(t,sa,ra,aa,Ol)||(t=[1,0,0,0,1,0,0,0,1],!Qu(t,sa,ra,aa,Ol))?!1:(kl.crossVectors(Os,ks),t=[kl.x,kl.y,kl.z],Qu(t,sa,ra,aa,Ol))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(es[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),es[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),es[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),es[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),es[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),es[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),es[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),es[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(es),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},es=[new C,new C,new C,new C,new C,new C,new C,new C],yi=new C,Ul=new qn,sa=new C,ra=new C,aa=new C,Os=new C,ks=new C,dr=new C,co=new C,Ol=new C,kl=new C,fr=new C;function Qu(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){fr.fromArray(i,r);let o=s.x*Math.abs(fr.x)+s.y*Math.abs(fr.y)+s.z*Math.abs(fr.z),l=e.dot(fr),c=t.dot(fr),h=n.dot(fr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var $t=new C,Bl=new Be,Rb=0,ut=class extends Si{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Rb++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Vd,this.updateRanges=[],this.gpuType=jn,this.version=0,this._normalizationScale=e!==void 0?Mh(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Bl.fromBufferAttribute(this,t),Bl.applyMatrix3(e),this.setXY(t,Bl.x,Bl.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix3(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):jd(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Kd(e,this.array)}};var Eo=class extends ut{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ao=class extends ut{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var It=class extends ut{constructor(e,t,n){super(new Float32Array(e),t,n)}},Cb=new qn,ho=new C,ed=new C,xn=class{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Cb.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ho.subVectors(e,this.center);let t=ho.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ho,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ed.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ho.copy(e.center).add(ed)),this.expandByPoint(ho.copy(e.center).sub(ed))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Pb=0,si=new qe,td=new Tt,oa=new C,Wn=new qn,uo=new qn,un=new C,Lt=class i extends Si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Pb++}),this.uuid=ki(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(tb(e)?Ao:Eo)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return si.makeRotationFromQuaternion(e),this.applyMatrix4(si),this}rotateX(e){return si.makeRotationX(e),this.applyMatrix4(si),this}rotateY(e){return si.makeRotationY(e),this.applyMatrix4(si),this}rotateZ(e){return si.makeRotationZ(e),this.applyMatrix4(si),this}translate(e,t,n){return si.makeTranslation(e,t,n),this.applyMatrix4(si),this}scale(e,t,n){return si.makeScale(e,t,n),this.applyMatrix4(si),this}lookAt(e){return td.lookAt(e),td.updateMatrix(),this.applyMatrix4(td.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(oa).negate(),this.translate(oa.x,oa.y,oa.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new It(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&ke("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Wn.setFromBufferAttribute(r),this.morphTargetsRelative?(un.addVectors(this.boundingBox.min,Wn.min),this.boundingBox.expandByPoint(un),un.addVectors(this.boundingBox.max,Wn.max),this.boundingBox.expandByPoint(un)):(this.boundingBox.expandByPoint(Wn.min),this.boundingBox.expandByPoint(Wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){let n=this.boundingSphere.center;if(Wn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];uo.setFromBufferAttribute(o),this.morphTargetsRelative?(un.addVectors(Wn.min,uo.min),Wn.expandByPoint(un),un.addVectors(Wn.max,uo.max),Wn.expandByPoint(un)):(Wn.expandByPoint(uo.min),Wn.expandByPoint(uo.max))}Wn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)un.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(un));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)un.fromBufferAttribute(o,c),l&&(oa.fromBufferAttribute(e,c),un.add(oa)),s=Math.max(s,n.distanceToSquared(un))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ut(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let L=0;L<n.count;L++)o[L]=new C,l[L]=new C;let h=new C,u=new C,d=new C,p=new Be,g=new Be,_=new Be,v=new C,m=new C;function x(L,I,N){c[L]=c[I]=c[N]=1,h.fromBufferAttribute(n,L),u.fromBufferAttribute(n,I),d.fromBufferAttribute(n,N),p.fromBufferAttribute(r,L),g.fromBufferAttribute(r,I),_.fromBufferAttribute(r,N),u.sub(h),d.sub(h),g.sub(p),_.sub(p);let k=1/(g.x*_.y-_.x*g.y);isFinite(k)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(d,-g.y).multiplyScalar(k),m.copy(d).multiplyScalar(g.x).addScaledVector(u,-_.x).multiplyScalar(k),o[L].add(v),o[I].add(v),o[N].add(v),l[L].add(m),l[I].add(m),l[N].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let L=0,I=S.length;L<I;++L){let N=S[L],k=N.start,V=N.count;for(let D=k,q=k+V;D<q;D+=3)x(e.getX(D+0),e.getX(D+1),e.getX(D+2))}let y=new C,R=new C,M=new C,b=new C;function w(L){M.fromBufferAttribute(s,L),b.copy(M);let I=o[L];y.copy(I),y.sub(M.multiplyScalar(M.dot(I))).normalize(),R.crossVectors(b,I);let k=R.dot(l[L])<0?-1:1;a.setXYZW(L,y.x,y.y,y.z,k)}for(let L=0,I=n.count;L<I;++L)c[L]&&w(L);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new ut(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new C,r=new C,a=new C,o=new C,l=new C,c=new C,h=new C,u=new C;if(e)for(let d=0,p=e.count;d<p;d+=3){let g=e.getX(d+0),_=e.getX(d+1),v=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,v),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,v),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(v,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)un.fromBufferAttribute(e,t),un.normalize(),e.setXYZ(t,un.x,un.y,un.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),p=0,g=0;for(let _=0,v=l.length;_<v;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let m=0;m<h;m++)d[g++]=c[p++]}return new ut(d,h,u)}if(this.index===null)return ke("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},_a=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Vd,this.updateRanges=[],this.version=0,this.uuid=ki()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Sm(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Sm(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Sm(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=ki()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var Cn=new C,Sa=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?Mh(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Cn.fromBufferAttribute(this,t),Cn.applyMatrix4(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Cn.fromBufferAttribute(this,t),Cn.applyNormalMatrix(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Cn.fromBufferAttribute(this,t),Cn.transformDirection(e),this.setXYZ(t,Cn.x,Cn.y,Cn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){So("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new ut(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){So("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):jd(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Kd(e,this.data.array)}},nd=new C,Ib=new C,Lb=new Ye,_i=class{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=nd.subVectors(n,t).cross(Ib.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(nd),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Lb.getNormalMatrix(e),s=this.coplanarPoint(nd).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Db=0,Un=class extends Si{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Db++}),this.uuid=ki(),this.name="",this.type="Material",this.blending=Xs,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Sd,this.blendDst=Md,this.blendEquation=Lr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Me(0,0,0),this.blendAlpha=0,this.depthFunc=fa,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Mg,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=rc,this.stencilZFail=rc,this.stencilZPass=rc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ke(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ke(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Me().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new _i().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Be().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Be().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var ts=new C,id=new C,zl=new C,Hl=new C,Sr=class{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ts)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ts.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ts.copy(this.origin).addScaledVector(this.direction,t),ts.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){id.copy(e).add(t).multiplyScalar(.5),zl.copy(t).sub(e).normalize(),Hl.copy(this.origin).sub(id);let r=e.distanceTo(t)*.5,a=-this.direction.dot(zl),o=Hl.dot(this.direction),l=-Hl.dot(zl),c=Hl.lengthSq(),h=Math.abs(1-a*a),u,d,p,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(id).addScaledVector(zl,d),p}intersectSphere(e,t){if(e.radius<0)return null;ts.subVectors(e.center,this.origin);let n=ts.dot(this.direction),s=ts.dot(ts)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ts)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=e.x-a.x,d=e.y-a.y,p=e.z-a.z,g=t.x-a.x,_=t.y-a.y,v=t.z-a.z,m=n.x-a.x,x=n.y-a.y,S=n.z-a.z,y=Math.abs(l),R=Math.abs(c),M=Math.abs(h),b,w,L,I,N,k,V,D,q,K,z,se;if(y>=R&&y>=M?(L=l,k=u,q=g,se=m,l>=0?(b=c,w=h,I=d,N=p,V=_,D=v,K=x,z=S):(b=h,w=c,I=p,N=d,V=v,D=_,K=S,z=x)):R>=M?(L=c,k=d,q=_,se=x,c>=0?(b=h,w=l,I=p,N=u,V=v,D=g,K=S,z=m):(b=l,w=h,I=u,N=p,V=g,D=v,K=m,z=S)):(L=h,k=p,q=v,se=S,h>=0?(b=l,w=c,I=u,N=d,V=g,D=_,K=m,z=x):(b=c,w=l,I=d,N=u,V=_,D=g,K=x,z=m)),L===0)return null;let X=b/L,Y=w/L,ee=1/L,he=I-X*k,de=N-Y*k,J=V-X*q,re=D-Y*q,Se=K-X*se,Ie=z-Y*se,le=Se*re-Ie*J,Xe=he*Ie-de*Se,Mt=J*de-re*he;if(s){if(le<0||Xe<0||Mt<0)return null}else if((le<0||Xe<0||Mt<0)&&(le>0||Xe>0||Mt>0))return null;let Oe=le+Xe+Mt;if(Oe===0)return null;let st=ee*(le*k+Xe*q+Mt*se);return(Oe>0?st<0:st>0)?null:this.at(st/Oe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dn=class extends Un{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Me(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rs,this.combine=wd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Mm=new qe,pr=new Sr,Gl=new xn,wm=new C,Vl=new C,Wl=new C,ql=new C,sd=new C,Xl=new C,Tm=new C,jl=new C,Et=class extends Tt{constructor(e=new Lt,t=new dn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Xl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(sd.fromBufferAttribute(u,e),a?Xl.addScaledVector(sd,h):Xl.addScaledVector(sd.sub(t),h))}t.add(Xl)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Gl.copy(n.boundingSphere),Gl.applyMatrix4(r),pr.copy(e.ray).recast(e.near),!(Gl.containsPoint(pr.origin)===!1&&(pr.intersectSphere(Gl,wm)===null||pr.origin.distanceToSquared(wm)>(e.far-e.near)**2))&&(Mm.copy(r).invert(),pr.copy(e.ray).applyMatrix4(Mm),!(n.boundingBox!==null&&pr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,pr)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let v=d[g],m=a[v.materialIndex],x=Math.max(v.start,p.start),S=Math.min(o.count,Math.min(v.start+v.count,p.start+p.count));for(let y=x,R=S;y<R;y+=3){let M=o.getX(y),b=o.getX(y+1),w=o.getX(y+2);s=Kl(this,m,e,n,c,h,u,M,b,w),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let v=g,m=_;v<m;v+=3){let x=o.getX(v),S=o.getX(v+1),y=o.getX(v+2);s=Kl(this,a,e,n,c,h,u,x,S,y),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let v=d[g],m=a[v.materialIndex],x=Math.max(v.start,p.start),S=Math.min(l.count,Math.min(v.start+v.count,p.start+p.count));for(let y=x,R=S;y<R;y+=3){let M=y,b=y+1,w=y+2;s=Kl(this,m,e,n,c,h,u,M,b,w),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let v=g,m=_;v<m;v+=3){let x=v,S=v+1,y=v+2;s=Kl(this,a,e,n,c,h,u,x,S,y),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}}};function Fb(i,e,t,n,s,r,a,o){let l;if(e.side===nn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Oi,o),l===null)return null;jl.copy(o),jl.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(jl);return c<t.near||c>t.far?null:{distance:c,point:jl.clone(),object:i}}function Kl(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Vl),i.getVertexPosition(l,Wl),i.getVertexPosition(c,ql);let h=Fb(i,e,t,n,Vl,Wl,ql,Tm);if(h){let u=new C;Hs.getBarycoord(Tm,Vl,Wl,ql,u),s&&(h.uv=Hs.getInterpolatedAttribute(s,o,l,c,u,new Be)),r&&(h.uv1=Hs.getInterpolatedAttribute(r,o,l,c,u,new Be)),a&&(h.normal=Hs.getInterpolatedAttribute(a,o,l,c,u,new C),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new C,materialIndex:0};Hs.getNormal(Vl,Wl,ql,d.normal),h.face=d,h.barycoord=u}return h}var fo=new St,Em=new St,Am=new St,Nb=new St,Rm=new qe,Yl=new C,rd=new xn,Cm=new qe,ad=new Sr,Mr=class extends Et{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=hd,this.bindMatrix=new qe,this.bindMatrixInverse=new qe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new qn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Yl),this.boundingBox.expandByPoint(Yl)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new xn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Yl),this.boundingSphere.expandByPoint(Yl)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),rd.copy(this.boundingSphere),rd.applyMatrix4(s),e.ray.intersectsSphere(rd)!==!1&&(Cm.copy(s).invert(),ad.copy(e.ray).applyMatrix4(Cm),!(this.boundingBox!==null&&ad.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,ad)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new St,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===hd?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===vg?this.bindMatrixInverse.copy(this.bindMatrix).invert():ke("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Em.fromBufferAttribute(s.attributes.skinIndex,e),Am.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(fo.copy(t),t.set(0,0,0,0)):(fo.set(t.x,t.y,t.z,1),t.set(0,0,0)),fo.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Am.getComponent(r);if(a!==0){let o=Em.getComponent(r);Rm.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Nb.copy(fo).applyMatrix4(Rm),a)}}return t.isVector4&&(t.w=fo.w),t.applyMatrix4(this.bindMatrixInverse)}},Ma=class extends Tt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Gs=class extends tn{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Xt,h=Xt,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Pm=new qe,Ub=new qe,Ro=class i{constructor(e=[],t=[]){this.uuid=ki(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){ke("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new qe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new qe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){let o=e[r]?e[r].matrixWorld:Ub;Pm.multiplyMatrices(o,t[r]),Pm.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Gs(t,e,e,Bn,jn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],a=t[r];a===void 0&&(ke("Skeleton: No bone found with UUID:",r),a=new Ma),this.bones.push(a),this.boneInverses.push(new qe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let a=t[s];e.bones.push(a.uuid);let o=n[s];e.boneInverses.push(o.toArray())}return e}},as=class extends ut{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},la=new qe,Im=new qe,Jl=[],Lm=new qn,Ob=new qe,po=new Et,mo=new xn,os=class extends Et{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new as(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ob)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,la),Lm.copy(e.boundingBox).applyMatrix4(la),this.boundingBox.union(Lm)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new xn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,la),mo.copy(e.boundingSphere).applyMatrix4(la),this.boundingSphere.union(mo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(po.geometry=this.geometry,po.material=this.material,po.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mo.copy(this.boundingSphere),mo.applyMatrix4(n),e.ray.intersectsSphere(mo)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,la),Im.multiplyMatrices(n,la),po.matrixWorld=Im,po.raycast(e,Jl);for(let a=0,o=Jl.length;a<o;a++){let l=Jl[a];l.instanceId=r,l.object=this,t.push(l)}Jl.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new as(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Gs(new Float32Array(s*this.count),s,this.count,zc,jn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},mr=new xn,kb=new Be(.5,.5),$l=new C,Vs=class{constructor(e=new _i,t=new _i,n=new _i,s=new _i,r=new _i,a=new _i){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ai,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],p=r[7],g=r[8],_=r[9],v=r[10],m=r[11],x=r[12],S=r[13],y=r[14],R=r[15];if(s[0].setComponents(c-a,p-h,m-g,R-x).normalize(),s[1].setComponents(c+a,p+h,m+g,R+x).normalize(),s[2].setComponents(c+o,p+u,m+_,R+S).normalize(),s[3].setComponents(c-o,p-u,m-_,R-S).normalize(),n)s[4].setComponents(l,d,v,y).normalize(),s[5].setComponents(c-l,p-d,m-v,R-y).normalize();else if(s[4].setComponents(c-l,p-d,m-v,R-y).normalize(),t===ai)s[5].setComponents(c+l,p+d,m+v,R+y).normalize();else if(t===ma)s[5].setComponents(l,d,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),mr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),mr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(mr)}intersectsSprite(e){mr.center.set(0,0,0);let t=kb.distanceTo(e.center);return mr.radius=.7071067811865476+t,mr.applyMatrix4(e.matrixWorld),this.intersectsSphere(mr)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if($l.x=s.normal.x>0?e.max.x:e.min.x,$l.y=s.normal.y>0?e.max.y:e.min.y,$l.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint($l)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Dm=new qe,gc=class i{constructor(){this.coordinateSystem=ai,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];Dm.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Vs),n[s].setFromProjectionMatrix(Dm,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Vs),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var wa=class extends Un{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Me(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},vc=new C,bc=new C,Fm=new qe,go=new Sr,Zl=new xn,od=new C,Nm=new C,wr=class extends Tt{constructor(e=new Lt,t=new wa){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)vc.fromBufferAttribute(t,s-1),bc.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=vc.distanceTo(bc);e.setAttribute("lineDistance",new It(n,1))}else ke("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Zl.copy(n.boundingSphere),Zl.applyMatrix4(s),Zl.radius+=r,e.ray.intersectsSphere(Zl)===!1)return;Fm.copy(s).invert(),go.copy(e.ray).applyMatrix4(Fm);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=p,v=g-1;_<v;_+=c){let m=h.getX(_),x=h.getX(_+1),S=Ql(this,e,go,l,m,x,_);S&&t.push(S)}if(this.isLineLoop){let _=h.getX(g-1),v=h.getX(p),m=Ql(this,e,go,l,_,v,g-1);m&&t.push(m)}}else{let p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=p,v=g-1;_<v;_+=c){let m=Ql(this,e,go,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=Ql(this,e,go,l,g-1,p,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Ql(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(vc.fromBufferAttribute(o,s),bc.fromBufferAttribute(o,r),t.distanceSqToSegment(vc,bc,od,Nm)>n)return;od.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(od);if(!(c<e.near||c>e.far))return{distance:c,point:Nm.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Um=new C,Om=new C,Co=class extends wr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Um.fromBufferAttribute(t,s),Om.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Um.distanceTo(Om);e.setAttribute("lineDistance",new It(n,1))}else ke("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Po=class extends wr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Ta=class extends Un{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Me(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},km=new qe,dd=new Sr,ec=new xn,tc=new C,Ws=class extends Tt{constructor(e=new Lt,t=new Ta){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ec.copy(n.boundingSphere),ec.applyMatrix4(s),ec.radius+=r,e.ray.intersectsSphere(ec)===!1)return;km.copy(s).invert(),dd.copy(e.ray).applyMatrix4(km);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=d,_=p;g<_;g++){let v=c.getX(g);tc.fromBufferAttribute(u,v),Bm(tc,v,l,s,e,t,this)}}else{let d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=d,_=p;g<_;g++)tc.fromBufferAttribute(u,g),Bm(tc,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Bm(i,e,t,n,s,r,a){let o=dd.distanceSqToPoint(i);if(o<t){let l=new C;dd.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Tr=class extends tn{constructor(e=[],t=Dr,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ea=class extends tn{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ls=class extends tn{constructor(e,t,n=Mi,s,r,a,o=Xt,l=Xt,c,h=ss,u=1){if(h!==ss&&h!==vs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ba(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Io=class extends ls{constructor(e,t=Mi,n=Dr,s,r,a=Xt,o=Xt,l,c=ss){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Lo=class extends tn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Aa=class i extends Lt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new It(c,3)),this.setAttribute("normal",new It(h,3)),this.setAttribute("uv",new It(u,2));function g(_,v,m,x,S,y,R,M,b,w,L){let I=y/b,N=R/w,k=y/2,V=R/2,D=M/2,q=b+1,K=w+1,z=0,se=0,X=new C;for(let Y=0;Y<K;Y++){let ee=Y*N-V;for(let he=0;he<q;he++){let de=he*I-k;X[_]=de*x,X[v]=ee*S,X[m]=D,c.push(X.x,X.y,X.z),X[_]=0,X[v]=0,X[m]=M>0?1:-1,h.push(X.x,X.y,X.z),u.push(he/b),u.push(1-Y/w),z+=1}}for(let Y=0;Y<w;Y++)for(let ee=0;ee<b;ee++){let he=d+ee+q*Y,de=d+ee+q*(Y+1),J=d+(ee+1)+q*(Y+1),re=d+(ee+1)+q*Y;l.push(he,de,re),l.push(de,J,re),se+=6}o.addGroup(p,se,L),p+=se,d+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Do=class i extends Lt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],g=0,_=[],v=n/2,m=0;x(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new It(u,3)),this.setAttribute("normal",new It(d,3)),this.setAttribute("uv",new It(p,2));function x(){let y=new C,R=new C,M=0,b=(t-e)/n;for(let w=0;w<=r;w++){let L=[],I=w/r,N=I*(t-e)+e;for(let k=0;k<=s;k++){let V=k/s,D=V*l+o,q=Math.sin(D),K=Math.cos(D);R.x=N*q,R.y=-I*n+v,R.z=N*K,u.push(R.x,R.y,R.z),y.set(q,b,K).normalize(),d.push(y.x,y.y,y.z),p.push(V,1-I),L.push(g++)}_.push(L)}for(let w=0;w<s;w++)for(let L=0;L<r;L++){let I=_[L][w],N=_[L+1][w],k=_[L+1][w+1],V=_[L][w+1];(e>0||L!==0)&&(h.push(I,N,V),M+=3),(t>0||L!==r-1)&&(h.push(N,k,V),M+=3)}c.addGroup(m,M,0),m+=M}function S(y){let R=g,M=new Be,b=new C,w=0,L=y===!0?e:t,I=y===!0?1:-1;for(let k=1;k<=s;k++)u.push(0,v*I,0),d.push(0,I,0),p.push(.5,.5),g++;let N=g;for(let k=0;k<=s;k++){let D=k/s*l+o,q=Math.cos(D),K=Math.sin(D);b.x=L*K,b.y=v*I,b.z=L*q,u.push(b.x,b.y,b.z),d.push(0,I,0),M.x=q*.5+.5,M.y=K*.5*I+.5,p.push(M.x,M.y),g++}for(let k=0;k<s;k++){let V=R+k,D=N+k;y===!0?h.push(D,D+1,V):h.push(D+1,D,V),w+=3}c.addGroup(m,w,y===!0?1:2),m+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var xc=class i extends Lt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new It(r,3)),this.setAttribute("normal",new It(r.slice(),3)),this.setAttribute("uv",new It(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(x){let S=new C,y=new C,R=new C;for(let M=0;M<t.length;M+=3)p(t[M+0],S),p(t[M+1],y),p(t[M+2],R),l(S,y,R,x)}function l(x,S,y,R){let M=R+1,b=[];for(let w=0;w<=M;w++){b[w]=[];let L=x.clone().lerp(y,w/M),I=S.clone().lerp(y,w/M),N=M-w;for(let k=0;k<=N;k++)k===0&&w===M?b[w][k]=L:b[w][k]=L.clone().lerp(I,k/N)}for(let w=0;w<M;w++)for(let L=0;L<2*(M-w)-1;L++){let I=Math.floor(L/2);L%2===0?(d(b[w][I+1]),d(b[w+1][I]),d(b[w][I])):(d(b[w][I+1]),d(b[w+1][I+1]),d(b[w+1][I]))}}function c(x){let S=new C;for(let y=0;y<r.length;y+=3)S.x=r[y+0],S.y=r[y+1],S.z=r[y+2],S.normalize().multiplyScalar(x),r[y+0]=S.x,r[y+1]=S.y,r[y+2]=S.z}function h(){let x=new C;for(let S=0;S<r.length;S+=3){x.x=r[S+0],x.y=r[S+1],x.z=r[S+2];let y=v(x)/2/Math.PI+.5,R=m(x)/Math.PI+.5;a.push(y,1-R)}g(),u()}function u(){for(let x=0;x<a.length;x+=6){let S=a[x+0],y=a[x+2],R=a[x+4],M=Math.max(S,y,R),b=Math.min(S,y,R);M>.9&&b<.1&&(S<.2&&(a[x+0]+=1),y<.2&&(a[x+2]+=1),R<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function p(x,S){let y=x*3;S.x=e[y+0],S.y=e[y+1],S.z=e[y+2]}function g(){let x=new C,S=new C,y=new C,R=new C,M=new Be,b=new Be,w=new Be;for(let L=0,I=0;L<r.length;L+=9,I+=6){x.set(r[L+0],r[L+1],r[L+2]),S.set(r[L+3],r[L+4],r[L+5]),y.set(r[L+6],r[L+7],r[L+8]),M.set(a[I+0],a[I+1]),b.set(a[I+2],a[I+3]),w.set(a[I+4],a[I+5]),R.copy(x).add(S).add(y).divideScalar(3);let N=v(R);_(M,I+0,x,N),_(b,I+2,S,N),_(w,I+4,y,N)}}function _(x,S,y,R){R<0&&x.x===1&&(a[S]=x.x-1),y.x===0&&y.z===0&&(a[S]=R/2/Math.PI+.5)}function v(x){return Math.atan2(x.z,-x.x)}function m(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}};var Fo=class i extends xc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var Er=class i extends Lt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,p=[],g=[],_=[],v=[];for(let m=0;m<h;m++){let x=m*d-a;for(let S=0;S<c;S++){let y=S*u-r;g.push(y,-x,0),_.push(0,0,1),v.push(S/o),v.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<o;x++){let S=x+c*m,y=x+c*(m+1),R=x+1+c*(m+1),M=x+1+c*m;p.push(S,y,M),p.push(y,R,M)}this.setIndex(p),this.setAttribute("position",new It(g,3)),this.setAttribute("normal",new It(_,3)),this.setAttribute("uv",new It(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Ar=class i extends Lt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new C,d=new C,p=[],g=[],_=[],v=[];for(let m=0;m<=n;m++){let x=[],S=m/n,y=a+S*o,R=e*Math.cos(y),M=Math.sqrt(e*e-R*R),b=0;m===0&&a===0?b=.5/t:m===n&&l===Math.PI&&(b=-.5/t);for(let w=0;w<=t;w++){let L=w/t,I=s+L*r;u.x=-M*Math.cos(I),u.y=R,u.z=M*Math.sin(I),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),v.push(L+b,1-S),x.push(c++)}h.push(x)}for(let m=0;m<n;m++)for(let x=0;x<t;x++){let S=h[m][x+1],y=h[m][x],R=h[m+1][x],M=h[m+1][x+1];(m!==0||a>0)&&p.push(S,y,M),(m!==n-1||l<Math.PI)&&p.push(y,R,M)}this.setIndex(p),this.setAttribute("position",new It(g,3)),this.setAttribute("normal",new It(_,3)),this.setAttribute("uv",new It(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Ur(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(zm(s))s.isRenderTargetTexture?(ke("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(zm(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Sn(i){let e={};for(let t=0;t<i.length;t++){let n=Ur(i[t]);for(let s in n)e[s]=n[s]}return e}function zm(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Bb(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Yd(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:at.workingColorSpace}var Or={clone:Ur,merge:Sn},zb=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Hb=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ft=class extends Un{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zb,this.fragmentShader=Hb,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ur(e.uniforms),this.uniformsGroups=Bb(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Me().setHex(s.value);break;case"v2":this.uniforms[n].value=new Be().fromArray(s.value);break;case"v3":this.uniforms[n].value=new C().fromArray(s.value);break;case"v4":this.uniforms[n].value=new St().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ye().fromArray(s.value);break;case"m4":this.uniforms[n].value=new qe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},yc=class extends Ft{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Xn=class extends Un{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Me(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Me(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Sh,this.normalScale=new Be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rs,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},In=class extends Xn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Be(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ct(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Me(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Me(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Me(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return br('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){br('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var _c=class extends Un{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=_g,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Sc=class extends Un{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function zs(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function vo(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Gb(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Hm(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){let o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function Vb(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}var Ni=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break t}a=t.length;break n}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Mc=class extends Ni{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:gr,endingEnd:gr}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case vr:r=e,o=2*t-n;break;case yo:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case vr:a=e,l=2*n-t;break;case yo:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),_=g*g,v=_*g,m=-d*v+2*d*_-d*g,x=(1+d)*v+(-1.5-2*d)*_+(-.5+d)*g+1,S=(-1-p)*v+(1.5+p)*_+.5*g,y=p*v-p*_;for(let R=0;R!==o;++R)r[R]=m*a[h+R]+x*a[c+R]+S*a[l+R]+y*a[u+R];return r}},No=class extends Ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},wc=class extends Ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Tc=class extends Ni{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-t)/(s-t),_=1-g;for(let v=0;v!==o;++v)r[v]=a[c+v]*_+a[l+v]*g;return r}let d=o*2,p=e-1;for(let g=0;g!==o;++g){let _=a[c+g],v=a[l+g],m=p*d+g*2,x=u[m],S=u[m+1],y=e*d+g*2,R=h[y],M=h[y+1],b=qb(n,t,x,R,s);r[g]=Fg(b,_,S,M,v)}return r}};function Fg(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Wb(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function qb(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Fg(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Wb(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var On=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=zs(t,this.TimeBufferType),this.values=zs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:zs(e.times,Array),values:zs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),vo(e.settings)&&(n.settings={inTangents:zs(e.settings.inTangents,Array),outTangents:zs(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new wc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new No(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Tc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case xr:t=this.InterpolantFactoryMethodDiscrete;break;case yr:t=this.InterpolantFactoryMethodLinear;break;case sc:t=this.InterpolantFactoryMethodSmooth;break;case ud:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ke("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xr;case this.InterpolantFactoryMethodLinear:return yr;case this.InterpolantFactoryMethodSmooth:return sc;case this.InterpolantFactoryMethodBezier:return ud}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;vo(this.settings)&&(Gm(this.settings.inTangents,e),Gm(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;vo(this.settings)&&(Vm(this.settings.inTangents,e),Vm(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Ke("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&nb(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===sc,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*n,d=u-n,p=u+n;for(let g=0;g!==n;++g){let _=t[u+g];if(_!==t[d+g]||_!==t[p+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*n,d=a*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,vo(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Gm(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function Vm(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}On.prototype.ValueTypeName="";On.prototype.TimeBufferType=Float32Array;On.prototype.ValueBufferType=Float32Array;On.prototype.DefaultInterpolation=yr;var cs=class extends On{constructor(e,t,n){super(e,t,n)}};cs.prototype.ValueTypeName="bool";cs.prototype.ValueBufferType=Array;cs.prototype.DefaultInterpolation=xr;cs.prototype.InterpolantFactoryMethodLinear=void 0;cs.prototype.InterpolantFactoryMethodSmooth=void 0;var Uo=class extends On{constructor(e,t,n,s){super(e,t,n,s)}};Uo.prototype.ValueTypeName="color";var hs=class extends On{constructor(e,t,n,s){super(e,t,n,s)}};hs.prototype.ValueTypeName="number";var Ec=class extends Ni{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)ht.slerpFlat(r,0,a,c-o,a,c,l);return r}},us=class extends On{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ec(this.times,this.values,this.getValueSize(),e)}};us.prototype.ValueTypeName="quaternion";us.prototype.InterpolantFactoryMethodSmooth=void 0;var ds=class extends On{constructor(e,t,n){super(e,t,n)}};ds.prototype.ValueTypeName="string";ds.prototype.ValueBufferType=Array;ds.prototype.DefaultInterpolation=xr;ds.prototype.InterpolantFactoryMethodLinear=void 0;ds.prototype.InterpolantFactoryMethodSmooth=void 0;var qs=class extends On{constructor(e,t,n,s){super(e,t,n,s)}};qs.prototype.ValueTypeName="vector";var Rr=class{constructor(e="",t=-1,n=[],s=_h){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=ki(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(jb(n[a]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(On.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);let h=Gb(l);l=Hm(l,1,h),c=Hm(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new hs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){let c=e[o],h=c.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(c)}}let a=[];for(let o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Xb(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return hs;case"vector":case"vector2":case"vector3":case"vector4":return qs;case"color":return Uo;case"quaternion":return us;case"bool":case"boolean":return cs;case"string":return ds}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function jb(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Xb(i.type);if(i.times===void 0){let n=[],s=[];Vb(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),vo(i.settings)&&(t.settings={inTangents:zs(i.settings.inTangents,Float32Array),outTangents:zs(i.settings.outTangents,Float32Array)}),t}var Di={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Wm(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Wm(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Wm(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ac=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ng=new Ac,Ui=class{constructor(e){this.manager=e!==void 0?e:Ng,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Ui.DEFAULT_MATERIAL_NAME="__DEFAULT";var ns={},fd=class extends Error{constructor(e,t){super(e),this.response=t}},Ra=class extends Ui{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Di.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ns[e]!==void 0){ns[e].push({onLoad:t,onProgress:n,onError:s});return}ns[e]=[],ns[e].push({onLoad:t,onProgress:n,onError:s});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&ke("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let h=ns[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),p=d?parseInt(d):0,g=p!==0,_=0,v=new ReadableStream({start(m){x();function x(){u.read().then(({done:S,value:y})=>{if(S)m.close();else{_+=y.byteLength;let R=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:p});for(let M=0,b=h.length;M<b;M++){let w=h[M];w.onProgress&&w.onProgress(R)}m.enqueue(y),x()}},S=>{m.error(S)})}}});return new Response(v)}else throw new fd(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,p=new TextDecoder(d);return c.arrayBuffer().then(g=>p.decode(g))}}}).then(c=>{Di.add(`file:${e}`,c);let h=ns[e];delete ns[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onLoad&&p.onLoad(c)}}).catch(c=>{let h=ns[e];if(h===void 0)throw this.manager.itemError(e),c;delete ns[e];for(let u=0,d=h.length;u<d;u++){let p=h[u];p.onError&&p.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var ca=new WeakMap,Rc=class extends Ui{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Di.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=ca.get(a);u===void 0&&(u=[],ca.set(a,u)),u.push({onLoad:t,onError:s})}return a}let o=ga("img");function l(){h(),t&&t(this);let u=ca.get(this)||[];for(let d=0;d<u.length;d++){let p=u[d];p.onLoad&&p.onLoad(this)}ca.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),Di.remove(`image:${e}`);let d=ca.get(this)||[];for(let p=0;p<d.length;p++){let g=d[p];g.onError&&g.onError(u)}ca.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Di.add(`image:${e}`,o),r.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}};var Oo=class extends Ui{constructor(e){super(e)}load(e,t,n,s){let r=new tn,a=new Rc(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},Cr=class extends Tt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Me(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ko=class extends Cr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Me(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},ld=new qe,qm=new C,Xm=new C,Ca=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Be(512,512),this.mapType=kn,this.map=null,this.mapPass=null,this.matrix=new qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Vs,this._frameExtents=new Be(1,1),this._viewportCount=1,this._viewports=[new St(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;qm.setFromMatrixPosition(e.matrixWorld),t.position.copy(qm),Xm.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Xm),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){ld.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(ld,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ma||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ld)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},nc=new C,ic=new ht,Li=new C,Bo=class extends Tt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new qe,this.projectionMatrix=new qe,this.projectionMatrixInverse=new qe,this.coordinateSystem=ai,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(nc,ic,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(nc,ic,Li.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(nc,ic,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(nc,ic,Li.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Bs=new C,jm=new Be,Km=new Be,en=class extends Bo{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=_r*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(bo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return _r*2*Math.atan(Math.tan(bo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Bs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Bs.x,Bs.y).multiplyScalar(-e/Bs.z),Bs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bs.x,Bs.y).multiplyScalar(-e/Bs.z)}getViewSize(e,t){return this.getViewBounds(e,jm,Km),t.subVectors(Km,jm)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(bo*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},pd=class extends Ca{constructor(){super(new en(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=_r*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},fs=class extends Cr{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new pd}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},md=class extends Ca{constructor(){super(new en(90,1,.5,500)),this.isPointLightShadow=!0}},Pr=class extends Cr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new md}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ps=class extends Bo{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},gd=class extends Ca{constructor(){super(new ps(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ir=class extends Cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tt.DEFAULT_UP),this.updateMatrix(),this.target=new Tt,this.shadow=new gd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ms=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var cd=new WeakMap,zo=class extends Ui{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&ke("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&ke("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Di.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{cd.has(a)===!0?(s&&s(cd.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}let o={};o.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",o.headers=this.requestHeader,o.priority=this.priority,o.cache=this.cache,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Di.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),cd.set(l,c),Di.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Di.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var ha=-90,ua=1,Pa=class extends Tt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new en(ha,ua,e,t);s.layers=this.layers,this.add(s);let r=new en(ha,ua,e,t);r.layers=this.layers,this.add(r);let a=new en(ha,ua,e,t);a.layers=this.layers,this.add(a);let o=new en(ha,ua,e,t);o.layers=this.layers,this.add(o);let l=new en(ha,ua,e,t);l.layers=this.layers,this.add(l);let c=new en(ha,ua,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===ai)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ma)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let v=!1;e.isWebGLRenderer===!0?v=e.state.buffers.depth.getReversed():v=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Cc=class extends en{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},Ho=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Kb.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function Kb(){this._document.hidden===!1&&this.reset()}var Pc=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,a;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,a=this.cumulativeWeight;if(a===0){for(let o=0;o!==s;++o)n[r+o]=n[o];a=t}else{a+=t;let o=t/a;this._mixBufferRegion(n,r,0,o,s)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,s,l,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,a=s;r!==a;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,s){ht.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let a=this._workIndex*r;ht.multiplyQuaternionsFlat(e,a,e,t,e,n),ht.slerpFlat(e,t,e,t,e,a,s)}_lerp(e,t,n,s,r){let a=1-s;for(let o=0;o!==r;++o){let l=t+o;e[l]=e[l]*a+e[n+o]*s}}_lerpAdditive(e,t,n,s,r){for(let a=0;a!==r;++a){let o=t+a;e[o]=e[o]+e[n+a]*s}}},Jd="\\[\\]\\.:\\/",Yb=new RegExp("["+Jd+"]","g"),$d="[^"+Jd+"]",Jb="[^"+Jd.replace("\\.","")+"]",$b=/((?:WC+[\/:])*)/.source.replace("WC",$d),Zb=/(WCOD+)?/.source.replace("WCOD",Jb),Qb=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",$d),ex=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",$d),tx=new RegExp("^"+$b+Zb+Qb+ex+"$"),nx=["material","materials","bones","map"],vd=class{constructor(e,t,n){let s=n||wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},wt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Yb,"")}static parseTrackName(e){let t=tx.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);nx.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ke("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};wt.Composite=vd;wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};wt.prototype.GetterByBindingType=[wt.prototype._getValue_direct,wt.prototype._getValue_array,wt.prototype._getValue_arrayElement,wt.prototype._getValue_toArray];wt.prototype.SetterByBindingTypeAndVersioning=[[wt.prototype._setValue_direct,wt.prototype._setValue_direct_setNeedsUpdate,wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_array,wt.prototype._setValue_array_setNeedsUpdate,wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_arrayElement,wt.prototype._setValue_arrayElement_setNeedsUpdate,wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_fromArray,wt.prototype._setValue_fromArray_setNeedsUpdate,wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Ic=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,a=r.length,o=new Array(a),l={endingStart:gr,endingEnd:gr};for(let c=0;c!==a;++c){let h=r[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=bg,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let s=this._clip.duration,r=e._clip.duration,a=r/s,o=s/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,a=this.timeScale,o=this._timeScaleInterpolant;o===null&&(o=s._lendControlInterpolant(),this._timeScaleInterpolant=o);let l=o.parameterPositions,c=o.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let a=this._updateTime(t),o=this._updateWeight(e);if(o>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case yg:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case _h:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(s,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,a=n===xg;if(e===0)return r===-1?s:a&&(r&1)===1?t-s:s;if(n===yh){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),s>=t||s<0){let o=Math.floor(s/t);s-=t*o,r+=Math.abs(o);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this._loopCount=r,this.time=s;if(a&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=vr,s.endingEnd=vr):(e?s.endingStart=this.zeroSlopeAtStart?vr:gr:s.endingStart=yo,t?s.endingEnd=this.zeroSlopeAtEnd?vr:gr:s.endingEnd=yo)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,a=this._weightInterpolant;a===null&&(a=s._lendControlInterpolant(),this._weightInterpolant=a);let o=a.parameterPositions,l=a.sampleValues;return o[0]=r,l[0]=t,o[1]=r+e,l[1]=n,this}},ix=new Float32Array(1),Go=class extends Si{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){let d=s[u],p=d.name,g=h[p];if(g!==void 0)++g.referenceCount,a[u]=g;else{if(g=a[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,p));continue}let _=t&&t._propertyBindings[u].binding.parsedPath;g=new Pc(wt.create(n,p,_),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,p),a[u]=g}o[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{let o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=s.length,s.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,a=this._actionsByClip,o=a[r],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;let u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,a=s[t];a===void 0&&(a={},s[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[s],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new No(new Float32Array(2),new Float32Array(2),1,ix),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,a=typeof e=="string"?Rr.findByName(s,e):e,o=a!==null?a.uuid:e,l=this._actionsByClip[o],c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=_h),l!==void 0){let u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;let h=new Ic(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,r),h}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?Rr.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(s,e,r,a);let o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let a=r.knownActions;for(let o=0,l=a.length;o!==l;++o){let c=a[o];this._deactivateAction(c);let h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let a in n){let o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let a in r){let o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var sf=class sf{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};sf.prototype.isMatrix2=!0;var bd=sf;function Zd(i,e,t,n){let s=sx(n);switch(t){case Od:return i*e;case zc:return i*e/s.components*s.byteLength;case Hc:return i*e/s.components*s.byteLength;case js:return i*e*2/s.components*s.byteLength;case Gc:return i*e*2/s.components*s.byteLength;case kd:return i*e*3/s.components*s.byteLength;case Bn:return i*e*4/s.components*s.byteLength;case Vc:return i*e*4/s.components*s.byteLength;case qo:case Xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case jo:case Ko:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case qc:case jc:return Math.max(i,16)*Math.max(e,8)/4;case Wc:case Xc:return Math.max(i,8)*Math.max(e,8)/2;case Kc:case Yc:case $c:case Zc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Jc:case Yo:case Qc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case eh:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case th:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case nh:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ih:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case sh:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case rh:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ah:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case oh:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case lh:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ch:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case hh:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case uh:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case dh:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case fh:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ph:case mh:case gh:return Math.ceil(i/4)*Math.ceil(e/4)*16;case vh:case bh:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Jo:case xh:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function sx(i){switch(i){case kn:case Dd:return{byteLength:1,components:1};case Fa:case Fd:case sn:return{byteLength:2,components:1};case kc:case Bc:return{byteLength:2,components:4};case Mi:case Oc:case jn:return{byteLength:4,components:1};case Nd:case Ud:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?ke("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function i0(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function ax(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<u.length;p++){let g=u[d],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let p=0,g=u.length;p<g;p++){let _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var ox=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,lx=`#ifdef USE_ALPHAHASH
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
#endif`,cx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,hx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ux=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,dx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,fx=`#ifdef USE_AOMAP
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
#endif`,px=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,mx=`#ifdef USE_BATCHING
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
#endif`,gx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xx=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,yx=`#ifdef USE_IRIDESCENCE
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
#endif`,_x=`#ifdef USE_BUMPMAP
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
#endif`,Sx=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Mx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ex=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ax=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Rx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Cx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Px=`#define PI 3.141592653589793
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
} // validated`,Ix=`vec3 transformedNormal = objectNormal;
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
#endif`,Lx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ux="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ox=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,kx=`#ifdef USE_ENVMAP
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
#endif`,Bx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,zx=`#ifdef USE_ENVMAP
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
#endif`,Hx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gx=`#ifdef USE_ENVMAP
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
#endif`,Vx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jx=`#ifdef USE_GRADIENTMAP
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
}`,Kx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Yx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$x=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Zx=`#ifdef USE_ENVMAP
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
#endif`,Qx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ey=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ty=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ny=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,iy=`PhysicalMaterial material;
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
#endif`,sy=`uniform sampler2D dfgLUT;
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
}`,ry=`
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
#endif`,ay=`#if defined( RE_IndirectDiffuse )
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
#endif`,oy=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ly=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,cy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,uy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,fy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,py=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,my=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,gy=`#if defined( USE_POINTS_UV )
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
#endif`,vy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,by=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,yy=`#if defined( USE_MORPHCOLORS )
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
#endif`,_y=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sy=`#ifdef USE_MORPHTARGETS
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
#endif`,My=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ty=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Ey=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ay=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ry=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Cy=`#ifdef USE_NORMALMAP
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
#endif`,Py=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Iy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ly=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Dy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ny=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Uy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Oy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ky=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,By=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,zy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Hy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Gy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Vy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Wy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,qy=`float getShadowMask() {
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
}`,Xy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jy=`#ifdef USE_SKINNING
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
#endif`,Ky=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Yy=`#ifdef USE_SKINNING
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
#endif`,Jy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$y=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Zy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,e_=`#ifdef USE_TRANSMISSION
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
#endif`,t_=`#ifdef USE_TRANSMISSION
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
#endif`,n_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,i_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,s_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,r_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,a_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,o_=`uniform sampler2D t2D;
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
}`,l_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,c_=`uniform float backgroundBlurriness;
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
}`,h_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,u_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d_=`#include <common>
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
}`,f_=`#if DEPTH_PACKING == 3200
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
}`,p_=`#define DISTANCE
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
}`,m_=`#define DISTANCE
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
}`,g_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,v_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b_=`uniform float scale;
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
}`,x_=`uniform vec3 diffuse;
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
}`,y_=`#include <common>
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
}`,__=`uniform vec3 diffuse;
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
}`,S_=`#define LAMBERT
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
}`,M_=`#define LAMBERT
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
}`,w_=`#define MATCAP
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
}`,T_=`#define MATCAP
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
}`,E_=`#define NORMAL
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
}`,A_=`#define NORMAL
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
}`,R_=`#define PHONG
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
}`,C_=`#define PHONG
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
}`,P_=`#define STANDARD
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
}`,I_=`#define STANDARD
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
}`,L_=`#define TOON
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
}`,D_=`#define TOON
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
}`,F_=`uniform float size;
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
}`,N_=`uniform vec3 diffuse;
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
}`,U_=`#include <common>
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
}`,O_=`uniform vec3 color;
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
}`,k_=`uniform float rotation;
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
}`,B_=`uniform vec3 diffuse;
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
}`,tt={alphahash_fragment:ox,alphahash_pars_fragment:lx,alphamap_fragment:cx,alphamap_pars_fragment:hx,alphatest_fragment:ux,alphatest_pars_fragment:dx,aomap_fragment:fx,aomap_pars_fragment:px,batching_pars_vertex:mx,batching_vertex:gx,begin_vertex:vx,beginnormal_vertex:bx,bsdfs:xx,iridescence_fragment:yx,bumpmap_pars_fragment:_x,clipping_planes_fragment:Sx,clipping_planes_pars_fragment:Mx,clipping_planes_pars_vertex:wx,clipping_planes_vertex:Tx,color_fragment:Ex,color_pars_fragment:Ax,color_pars_vertex:Rx,color_vertex:Cx,common:Px,defaultnormal_vertex:Ix,displacementmap_pars_vertex:Lx,displacementmap_vertex:Dx,emissivemap_fragment:Fx,emissivemap_pars_fragment:Nx,colorspace_fragment:Ux,colorspace_pars_fragment:Ox,envmap_fragment:kx,envmap_common_pars_fragment:Bx,envmap_pars_fragment:zx,envmap_pars_vertex:Hx,envmap_physical_pars_fragment:Zx,envmap_vertex:Gx,fog_vertex:Vx,fog_pars_vertex:Wx,fog_fragment:qx,fog_pars_fragment:Xx,gradientmap_pars_fragment:jx,lightmap_pars_fragment:Kx,lights_lambert_fragment:Yx,lights_lambert_pars_fragment:Jx,lights_pars_begin:$x,lights_toon_fragment:Qx,lights_toon_pars_fragment:ey,lights_phong_fragment:ty,lights_phong_pars_fragment:ny,lights_physical_fragment:iy,lights_physical_pars_fragment:sy,lights_fragment_begin:ry,lights_fragment_maps:ay,lights_fragment_end:oy,lightprobes_pars_fragment:ly,logdepthbuf_fragment:cy,logdepthbuf_pars_fragment:hy,logdepthbuf_pars_vertex:uy,logdepthbuf_vertex:dy,map_fragment:fy,map_pars_fragment:py,map_particle_fragment:my,map_particle_pars_fragment:gy,metalnessmap_fragment:vy,metalnessmap_pars_fragment:by,morphinstance_vertex:xy,morphcolor_vertex:yy,morphnormal_vertex:_y,morphtarget_pars_vertex:Sy,morphtarget_vertex:My,normal_fragment_begin:wy,normal_fragment_maps:Ty,normal_pars_fragment:Ey,normal_pars_vertex:Ay,normal_vertex:Ry,normalmap_pars_fragment:Cy,clearcoat_normal_fragment_begin:Py,clearcoat_normal_fragment_maps:Iy,clearcoat_pars_fragment:Ly,iridescence_pars_fragment:Dy,opaque_fragment:Fy,packing:Ny,premultiplied_alpha_fragment:Uy,project_vertex:Oy,dithering_fragment:ky,dithering_pars_fragment:By,roughnessmap_fragment:zy,roughnessmap_pars_fragment:Hy,shadowmap_pars_fragment:Gy,shadowmap_pars_vertex:Vy,shadowmap_vertex:Wy,shadowmask_pars_fragment:qy,skinbase_vertex:Xy,skinning_pars_vertex:jy,skinning_vertex:Ky,skinnormal_vertex:Yy,specularmap_fragment:Jy,specularmap_pars_fragment:$y,tonemapping_fragment:Zy,tonemapping_pars_fragment:Qy,transmission_fragment:e_,transmission_pars_fragment:t_,uv_pars_fragment:n_,uv_pars_vertex:i_,uv_vertex:s_,worldpos_vertex:r_,background_vert:a_,background_frag:o_,backgroundCube_vert:l_,backgroundCube_frag:c_,cube_vert:h_,cube_frag:u_,depth_vert:d_,depth_frag:f_,distance_vert:p_,distance_frag:m_,equirect_vert:g_,equirect_frag:v_,linedashed_vert:b_,linedashed_frag:x_,meshbasic_vert:y_,meshbasic_frag:__,meshlambert_vert:S_,meshlambert_frag:M_,meshmatcap_vert:w_,meshmatcap_frag:T_,meshnormal_vert:E_,meshnormal_frag:A_,meshphong_vert:R_,meshphong_frag:C_,meshphysical_vert:P_,meshphysical_frag:I_,meshtoon_vert:L_,meshtoon_frag:D_,points_vert:F_,points_frag:N_,shadow_vert:U_,shadow_frag:O_,sprite_vert:k_,sprite_frag:B_},Ae={common:{diffuse:{value:new Me(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new Be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Me(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Me(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Me(16777215)},opacity:{value:1},center:{value:new Be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},zi={basic:{uniforms:Sn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.fog]),vertexShader:tt.meshbasic_vert,fragmentShader:tt.meshbasic_frag},lambert:{uniforms:Sn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Me(0)},envMapIntensity:{value:1}}]),vertexShader:tt.meshlambert_vert,fragmentShader:tt.meshlambert_frag},phong:{uniforms:Sn([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Me(0)},specular:{value:new Me(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:tt.meshphong_vert,fragmentShader:tt.meshphong_frag},standard:{uniforms:Sn([Ae.common,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.roughnessmap,Ae.metalnessmap,Ae.fog,Ae.lights,{emissive:{value:new Me(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag},toon:{uniforms:Sn([Ae.common,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.gradientmap,Ae.fog,Ae.lights,{emissive:{value:new Me(0)}}]),vertexShader:tt.meshtoon_vert,fragmentShader:tt.meshtoon_frag},matcap:{uniforms:Sn([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,{matcap:{value:null}}]),vertexShader:tt.meshmatcap_vert,fragmentShader:tt.meshmatcap_frag},points:{uniforms:Sn([Ae.points,Ae.fog]),vertexShader:tt.points_vert,fragmentShader:tt.points_frag},dashed:{uniforms:Sn([Ae.common,Ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:tt.linedashed_vert,fragmentShader:tt.linedashed_frag},depth:{uniforms:Sn([Ae.common,Ae.displacementmap]),vertexShader:tt.depth_vert,fragmentShader:tt.depth_frag},normal:{uniforms:Sn([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,{opacity:{value:1}}]),vertexShader:tt.meshnormal_vert,fragmentShader:tt.meshnormal_frag},sprite:{uniforms:Sn([Ae.sprite,Ae.fog]),vertexShader:tt.sprite_vert,fragmentShader:tt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:tt.background_vert,fragmentShader:tt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:tt.backgroundCube_vert,fragmentShader:tt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:tt.cube_vert,fragmentShader:tt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:tt.equirect_vert,fragmentShader:tt.equirect_frag},distance:{uniforms:Sn([Ae.common,Ae.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:tt.distance_vert,fragmentShader:tt.distance_frag},shadow:{uniforms:Sn([Ae.lights,Ae.fog,{color:{value:new Me(0)},opacity:{value:1}}]),vertexShader:tt.shadow_vert,fragmentShader:tt.shadow_frag}};zi.physical={uniforms:Sn([zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new Be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ye},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Me(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new Be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Me(0)},specularColor:{value:new Me(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new Be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:tt.meshphysical_vert,fragmentShader:tt.meshphysical_frag};var Th={r:0,b:0,g:0},z_=new qe,s0=new Ye;s0.set(-1,0,0,0,1,0,0,0,1);function H_(i,e,t,n,s,r){let a=new Me(0),o=s===!0?0:1,l,c,h=null,u=0,d=null;function p(x){let S=x.isScene===!0?x.background:null;if(S&&S.isTexture){let y=x.backgroundBlurriness>0;S=e.get(S,y)}return S}function g(x){let S=!1,y=p(x);y===null?v(a,o):y&&y.isColor&&(v(y,1),S=!0);let R=i.xr.getEnvironmentBlendMode();R==="additive"?t.buffers.color.setClear(0,0,0,1,r):R==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(x,S){let y=p(S);y&&y.isCubeTexture?(c===void 0&&(c=new Et(new Aa(1,1,1),new Ft({name:"BackgroundCubeMaterial",uniforms:Ur(zi.backgroundCube.uniforms),vertexShader:zi.backgroundCube.vertexShader,fragmentShader:zi.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(R,M,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(z_.makeRotationFromEuler(S.backgroundRotation)).transpose(),y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(s0),c.material.toneMapped=at.getTransfer(y.colorSpace)!==yt,(h!==y||u!==y.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Et(new Er(2,2),new Ft({name:"BackgroundMaterial",uniforms:Ur(zi.background.uniforms),vertexShader:zi.background.vertexShader,fragmentShader:zi.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=at.getTransfer(y.colorSpace)!==yt,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function v(x,S){x.getRGB(Th,Yd(i)),t.buffers.color.setClear(Th.r,Th.g,Th.b,S,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,S=1){a.set(x),o=S,v(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,v(a,o)},render:g,addToRenderList:_,dispose:m}}function G_(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(N,k,V,D,q){let K=!1,z=u(N,D,V,k);r!==z&&(r=z,c(r.object)),K=p(N,D,V,q),K&&g(N,D,V,q),q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),(K||a)&&(a=!1,y(N,k,V,D),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function u(N,k,V,D){let q=D.wireframe===!0,K=n[k.id];K===void 0&&(K={},n[k.id]=K);let z=N.isInstancedMesh===!0?N.id:0,se=K[z];se===void 0&&(se={},K[z]=se);let X=se[V.id];X===void 0&&(X={},se[V.id]=X);let Y=X[q];return Y===void 0&&(Y=d(l()),X[q]=Y),Y}function d(N){let k=[],V=[],D=[];for(let q=0;q<t;q++)k[q]=0,V[q]=0,D[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:V,attributeDivisors:D,object:N,attributes:{},index:null}}function p(N,k,V,D){let q=r.attributes,K=k.attributes,z=0,se=V.getAttributes();for(let X in se)if(se[X].location>=0){let ee=q[X],he=K[X];if(he===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(he=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(he=N.instanceColor)),ee===void 0||ee.attribute!==he||he&&ee.data!==he.data)return!0;z++}return r.attributesNum!==z||r.index!==D}function g(N,k,V,D){let q={},K=k.attributes,z=0,se=V.getAttributes();for(let X in se)if(se[X].location>=0){let ee=K[X];ee===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(ee=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(ee=N.instanceColor));let he={};he.attribute=ee,ee&&ee.data&&(he.data=ee.data),q[X]=he,z++}r.attributes=q,r.attributesNum=z,r.index=D}function _(){let N=r.newAttributes;for(let k=0,V=N.length;k<V;k++)N[k]=0}function v(N){m(N,0)}function m(N,k){let V=r.newAttributes,D=r.enabledAttributes,q=r.attributeDivisors;V[N]=1,D[N]===0&&(i.enableVertexAttribArray(N),D[N]=1),q[N]!==k&&(i.vertexAttribDivisor(N,k),q[N]=k)}function x(){let N=r.newAttributes,k=r.enabledAttributes;for(let V=0,D=k.length;V<D;V++)k[V]!==N[V]&&(i.disableVertexAttribArray(V),k[V]=0)}function S(N,k,V,D,q,K,z){z===!0?i.vertexAttribIPointer(N,k,V,q,K):i.vertexAttribPointer(N,k,V,D,q,K)}function y(N,k,V,D){_();let q=D.attributes,K=V.getAttributes(),z=k.defaultAttributeValues;for(let se in K){let X=K[se];if(X.location>=0){let Y=q[se];if(Y===void 0&&(se==="instanceMatrix"&&N.instanceMatrix&&(Y=N.instanceMatrix),se==="instanceColor"&&N.instanceColor&&(Y=N.instanceColor)),Y!==void 0){let ee=Y.normalized,he=Y.itemSize,de=e.get(Y);if(de===void 0)continue;let J=de.buffer,re=de.type,Se=de.bytesPerElement,Ie=re===i.INT||re===i.UNSIGNED_INT||Y.gpuType===Oc;if(Y.isInterleavedBufferAttribute){let le=Y.data,Xe=le.isInterleavedBuffer===!0?le.stride:le.itemSize,Mt=Y.offset;if(le.isInstancedInterleavedBuffer||le.isInstancedBufferAttribute){for(let Oe=0;Oe<X.locationSize;Oe++)m(X.location+Oe,le.meshPerAttribute);N.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Oe=0;Oe<X.locationSize;Oe++)v(X.location+Oe);i.bindBuffer(i.ARRAY_BUFFER,J);for(let Oe=0;Oe<X.locationSize;Oe++)S(X.location+Oe,he/X.locationSize,re,ee,Xe*Se,(Mt+he/X.locationSize*Oe)*Se,Ie)}else{if(Y.isInstancedBufferAttribute){for(let le=0;le<X.locationSize;le++)m(X.location+le,Y.meshPerAttribute);N.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let le=0;le<X.locationSize;le++)v(X.location+le);i.bindBuffer(i.ARRAY_BUFFER,J);for(let le=0;le<X.locationSize;le++)S(X.location+le,he/X.locationSize,re,ee,he*Se,he/X.locationSize*le*Se,Ie)}}else if(z!==void 0){let ee=z[se];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(X.location,ee);break;case 3:i.vertexAttrib3fv(X.location,ee);break;case 4:i.vertexAttrib4fv(X.location,ee);break;default:i.vertexAttrib1fv(X.location,ee)}}}}x()}function R(){L();for(let N in n){let k=n[N];for(let V in k){let D=k[V];for(let q in D){let K=D[q];for(let z in K)h(K[z].object),delete K[z];delete D[q]}}delete n[N]}}function M(N){if(n[N.id]===void 0)return;let k=n[N.id];for(let V in k){let D=k[V];for(let q in D){let K=D[q];for(let z in K)h(K[z].object),delete K[z];delete D[q]}}delete n[N.id]}function b(N){for(let k in n){let V=n[k];for(let D in V){let q=V[D];if(q[N.id]===void 0)continue;let K=q[N.id];for(let z in K)h(K[z].object),delete K[z];delete q[N.id]}}}function w(N){for(let k in n){let V=n[k],D=N.isInstancedMesh===!0?N.id:0,q=V[D];if(q!==void 0){for(let K in q){let z=q[K];for(let se in z)h(z[se].object),delete z[se];delete q[K]}delete V[D],Object.keys(V).length===0&&delete n[k]}}}function L(){I(),a=!0,r!==s&&(r=s,c(r.object))}function I(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:I,dispose:R,releaseStatesOfGeometry:M,releaseStatesOfObject:w,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:v,disableUnusedAttributes:x}}function V_(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let p=0;p<h;p++)d+=c[p];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function W_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(b){return!(b!==Bn&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(b){let w=b===sn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==kn&&b!==jn&&!w&&n.convert(b)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(b){if(b==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(ke("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&u===!1;t.reversedDepthBuffer===!0&&u===!1&&ke("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&u===!0&&ke("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=i.getParameter(i.MAX_SAMPLES),M=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:x,maxVaryings:S,maxFragmentUniforms:y,maxSamples:R,samples:M}}function q_(i){let e=this,t=null,n=0,s=!1,r=!1,a=new _i,o=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let g=u.clippingPlanes,_=u.clipIntersection,v=u.clipShadows,m=i.get(u);if(!s||g===null||g.length===0||r&&!v)r?h(null):c();else{let x=r?0:n,S=x*4,y=m.clippingState||null;l.value=y,y=h(g,d,S,p);for(let R=0;R!==S;++R)y[R]=t[R];m.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,g){let _=u!==null?u.length:0,v=null;if(_!==0){if(v=l.value,g!==!0||v===null){let m=p+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(v===null||v.length<m)&&(v=new Float32Array(m));for(let S=0,y=p;S!==_;++S,y+=4)a.copy(u[S]).applyMatrix4(x,o),a.normal.toArray(v,y),v[y+3]=a.constant}l.value=v,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,v}}var el=class extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Tr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Aa(5,5,5),r=new Ft({name:"CubemapFromEquirect",uniforms:Ur(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:nn,blending:gs});r.uniforms.tEquirect.value=t;let a=new Et(s,r),o=t.minFilter;return t.minFilter===_n&&(t.minFilter=Ht),new Pa(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},Ug=256,X_=3,j_=20,r0=256,a0=16,K_=3,Y_=new C,J_=new Me,ka=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Pa(1,10,null),this._boxMesh=new Et(new Aa(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Y_}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let u=l.autoClear,d=l.autoClearColor,p=l.autoClearDepth,g=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(J_));let v=new Pa(n,s,h);return v.position.copy(o),v.update(l,e),l.autoClear=u,l.autoClearColor=d,l.autoClearDepth=p,l.autoClearStencil=g,e.background=_,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Ug,Xd(e))}_fromTexture(e,t){e.mapping===Dr||e.mapping===La?this._setSize(e.image.length===0?Ug:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Og(e,!1,!1),n=Math.log2(e)-X_;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Og(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Dr||e.mapping===La?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bg()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=kg()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=$_(),this._integrationMaterial=Z_());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/a0);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-K_)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let l=o>0?Math.log2(t)+.5*Math.log2(6/(r0*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Q_());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function Og(i,e,t){return new el(i,{minFilter:_n,generateMipmaps:e,type:sn,colorSpace:Pn,depthBuffer:t})}function tl(i,e,t){return new Ft({name:i,uniforms:e,vertexShader:tt.cube_vert,fragmentShader:t,side:nn,blending:gs,depthTest:!1,depthWrite:!1})}function $_(){return tl("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${r0}u

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
	`)}function Z_(){return tl("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:a0}},`

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
	`)}function Q_(){return tl("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${j_}
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
	`)}function kg(){return tl("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Bg(){return tl("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function eS(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,p=!1){return d==null?null:p?a(d):r(d)}function r(d){if(d&&d.isTexture){let p=d.mapping;if(p===Fc||p===Nc)if(e.has(d)){let g=e.get(d).texture;return o(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let _=new el(g.height);return _.fromEquirectangularTexture(i,d),e.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let p=d.mapping,g=p===Fc||p===Nc,_=p===Dr||p===La;if(g||_){let v=t.get(d),m=v!==void 0?v.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return n===null&&(n=new ka(i)),v=g?n.fromEquirectangular(d,v):n.fromCubemap(d,v),v.texture.pmremVersion=d.pmremVersion,t.set(d,v),v.texture;if(v!==void 0)return v.texture;{let x=d.image;return g&&x&&x.height>0||_&&x&&l(x)?(n===null&&(n=new ka(i)),v=g?n.fromEquirectangular(d):n.fromCubemap(d),v.texture.pmremVersion=d.pmremVersion,t.set(d,v),d.addEventListener("dispose",h),v.texture):null}}}return d}function o(d,p){return p===Fc?d.mapping=Dr:p===Nc&&(d.mapping=La),d}function l(d){let p=0,g=6;for(let _=0;_<g;_++)d[_]!==void 0&&p++;return p===g}function c(d){let p=d.target;p.removeEventListener("dispose",c);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function h(d){let p=d.target;p.removeEventListener("dispose",h);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function tS(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&br("WebGLRenderer: "+n+" extension not supported."),s}}}function nS(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(g=>delete s[g]);function o(g){l(g.target)}function l(g){g.index!==null&&e.remove(g.index);for(let v in g.attributes)e.remove(g.attributes[v]);g.removeEventListener("dispose",o),delete s[g.id],a.unregister(g);let _=r.get(g);_&&(e.remove(_),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function c(g,_){return s[_.id]!==void 0||(_.addEventListener("dispose",o),s[_.id]=new WeakRef(_),a.register(_,_.id,_),t.memory.geometries++),_}function h(g){let _=g.attributes;for(let v in _)e.update(_[v],i.ARRAY_BUFFER)}function u(g){let _=g.index,v=g.attributes.position,m=0;if(v===void 0)return;let x=_!==null?_.array.length:v.array.length/3-1,S=v.count>=65535?Ao:Eo,y=new S(Math.ceil(x/3)*6,1),R=y.array;if(_!==null){let b=_.array;m=_.version;for(let w=0,L=0;w<x;w+=3){let I=b[w+0],N=b[w+1],k=b[w+2];R[L++]=I,R[L++]=N,R[L++]=N,R[L++]=k,R[L++]=k,R[L++]=I}}else{m=v.version;for(let b=0,w=0;b<x;b+=3){let L=b+0,I=b+1,N=b+2;R[w++]=L,R[w++]=I,R[w++]=I,R[w++]=N,R[w++]=N,R[w++]=L}}y.version=m;let M=r.get(g);M&&e.remove(M),r.set(g,y)}function d(g){let _=r.get(g);if(_){let v=g.index;v!==null&&_.version<v.version&&u(g)}else u(g);return r.get(g)}function p(){for(let g in s){let _=s[g].deref();_!==void 0&&l(_)}}return{get:c,update:h,getWireframeAttribute:d,dispose:p}}function iS(i,e,t){let n;function s(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){i.drawElements(n,d,r,u*a),t.update(d,n,1)}function c(u,d,p){p!==0&&(i.drawElementsInstanced(n,d,r,u*a,p),t.update(d,n,p))}function h(u,d,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,p);let _=0;for(let v=0;v<p;v++)_+=d[v];t.update(_,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function sS(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Ke("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function rS(i,e,t){let n=new WeakMap,s=new St;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let L=function(){b.dispose(),n.delete(o),o.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,v=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],S=0;p===!0&&(S=1),g===!0&&(S=2),_===!0&&(S=3);let y=o.attributes.position.count*S,R=1;y>e.maxTextureSize&&(R=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let M=new Float32Array(y*R*4*u),b=new Mo(M,y,R,u);b.type=jn,b.needsUpdate=!0;let w=S*4;for(let I=0;I<u;I++){let N=v[I],k=m[I],V=x[I],D=y*R*4*I;for(let q=0;q<N.count;q++){let K=q*w;p===!0&&(s.fromBufferAttribute(N,q),M[D+K+0]=s.x,M[D+K+1]=s.y,M[D+K+2]=s.z,M[D+K+3]=0),g===!0&&(s.fromBufferAttribute(k,q),M[D+K+4]=s.x,M[D+K+5]=s.y,M[D+K+6]=s.z,M[D+K+7]=0),_===!0&&(s.fromBufferAttribute(V,q),M[D+K+8]=s.x,M[D+K+9]=s.y,M[D+K+10]=s.z,M[D+K+11]=V.itemSize===4?s.w:1)}}d={count:u,texture:b,size:new Be(y,R)},n.set(o,d),o.addEventListener("dispose",L)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function aS(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var oS={[Td]:"LINEAR_TONE_MAPPING",[Ed]:"REINHARD_TONE_MAPPING",[Ad]:"CINEON_TONE_MAPPING",[Rd]:"ACES_FILMIC_TONE_MAPPING",[Pd]:"AGX_TONE_MAPPING",[Id]:"NEUTRAL_TONE_MAPPING",[Cd]:"CUSTOM_TONE_MAPPING"};function lS(i,e,t,n,s,r){let a=new jt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,h=new Lt;h.setAttribute("position",new It([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new It([0,2,0,0,2,0],2));let u=new yc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new Et(h,u),p=new ps(-1,1,1,-1,0,1),g=null,_=null,v=!1,m,x=null,S=[],y=!1;this.setSize=function(R,M){a.setSize(R,M),o!==null&&o.setSize(R,M),l!==null&&l.setSize(R,M);for(let b=0;b<S.length;b++){let w=S[b];w.setSize&&w.setSize(R,M)}},this.setEffects=function(R){S=R,y=S.length>0&&S[0].isRenderPass===!0;let M=a.width,b=a.height;S.length>0&&o===null&&(o=new jt(M,b,{type:sn,depthBuffer:!1,stencilBuffer:!1}),l=new jt(M,b,{type:sn,depthBuffer:!1,stencilBuffer:!1}));let w=s===!0&&S.some(L=>L.needsDepthTexture===!0);w!==(a.depthTexture!==null)&&(w===!0&&c===null&&(c=new ls(M,b),r===!0&&(c.format=vs,c.type=Nr)),a.dispose(),a.depthTexture=w?c:null,a.resolveDepthBuffer=w,a.storeMultisampledDepthBuffer=w);for(let L=0;L<S.length;L++){let I=S[L];I.setSize&&I.setSize(M,b),w&&I.needsDepthTexture===!0&&I.setDepthTexture&&I.setDepthTexture(c)}},this.begin=function(R,M){if(v||R.toneMapping===oi&&S.length===0)return!1;if(x=M,M!==null){let b=M.width,w=M.height;(a.width!==b||a.height!==w)&&this.setSize(b,w)}return y===!1&&R.setRenderTarget(a),m=R.toneMapping,R.toneMapping=oi,!0},this.hasRenderPass=function(){return y},this.end=function(R,M){R.toneMapping=m,v=!0;let b=a,w=o;for(let L=0;L<S.length;L++){let I=S[L];I.enabled!==!1&&(I.render(R,w,b,M),I.needsSwap!==!1&&(b=w,w=w===o?l:o))}if(g!==R.outputColorSpace||_!==R.toneMapping){g=R.outputColorSpace,_=R.toneMapping,u.defines={},at.getTransfer(g)===yt&&(u.defines.SRGB_TRANSFER="");let L=oS[_];L&&(u.defines[L]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,R.setRenderTarget(x),R.render(d,p),x=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),h.dispose(),u.dispose()}}var o0=new tn,l0=new ls(1,1),c0=new Io(1),h0=new Mo,u0=new mc,d0=new Tr,zg=[],Hg=[],Gg=new Float32Array(16),Vg=new Float32Array(9),Wg=new Float32Array(4);function Ba(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=zg[s];if(r===void 0&&(r=new Float32Array(s),zg[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function rn(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function an(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Rh(i,e){let t=Hg[e];t===void 0&&(t=new Int32Array(e),Hg[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function cS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function hS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2fv(this.addr,e),an(t,e)}}function uS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(rn(t,e))return;i.uniform3fv(this.addr,e),an(t,e)}}function dS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4fv(this.addr,e),an(t,e)}}function fS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),an(t,e)}else{if(rn(t,n))return;Wg.set(n),i.uniformMatrix2fv(this.addr,!1,Wg),an(t,n)}}function pS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),an(t,e)}else{if(rn(t,n))return;Vg.set(n),i.uniformMatrix3fv(this.addr,!1,Vg),an(t,n)}}function mS(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),an(t,e)}else{if(rn(t,n))return;Gg.set(n),i.uniformMatrix4fv(this.addr,!1,Gg),an(t,n)}}function gS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function vS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2iv(this.addr,e),an(t,e)}}function bS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;i.uniform3iv(this.addr,e),an(t,e)}}function xS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4iv(this.addr,e),an(t,e)}}function yS(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function _S(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2uiv(this.addr,e),an(t,e)}}function SS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;i.uniform3uiv(this.addr,e),an(t,e)}}function MS(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4uiv(this.addr,e),an(t,e)}}function Ch(i){return i.version===0&&(i.compareFunction=Gd,i.needsUpdate=!0),i}function wS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=Ch(l0):r=o0,t.setTexture2D(e||r,s)}function TS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||u0,s)}function ES(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=Ch(c0):r=d0,t.setTextureCube(e||r,s)}function AS(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||h0,s)}function RS(i){switch(i){case 5126:return cS;case 35664:return hS;case 35665:return uS;case 35666:return dS;case 35674:return fS;case 35675:return pS;case 35676:return mS;case 5124:case 35670:return gS;case 35667:case 35671:return vS;case 35668:case 35672:return bS;case 35669:case 35673:return xS;case 5125:return yS;case 36294:return _S;case 36295:return SS;case 36296:return MS;case 35678:case 36198:case 36298:case 36306:case 35682:return wS;case 35679:case 36299:case 36307:return TS;case 35680:case 36300:case 36308:case 36293:return ES;case 36289:case 36303:case 36311:case 36292:return AS}}function CS(i,e){i.uniform1fv(this.addr,e)}function PS(i,e){let t=Ba(e,this.size,2);i.uniform2fv(this.addr,t)}function IS(i,e){let t=Ba(e,this.size,3);i.uniform3fv(this.addr,t)}function LS(i,e){let t=Ba(e,this.size,4);i.uniform4fv(this.addr,t)}function DS(i,e){let t=Ba(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function FS(i,e){let t=Ba(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function NS(i,e){let t=Ba(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function US(i,e){i.uniform1iv(this.addr,e)}function OS(i,e){i.uniform2iv(this.addr,e)}function kS(i,e){i.uniform3iv(this.addr,e)}function BS(i,e){i.uniform4iv(this.addr,e)}function zS(i,e){i.uniform1uiv(this.addr,e)}function HS(i,e){i.uniform2uiv(this.addr,e)}function GS(i,e){i.uniform3uiv(this.addr,e)}function VS(i,e){i.uniform4uiv(this.addr,e)}function WS(i,e,t){let n=this.cache,s=e.length,r=Rh(t,s);rn(n,r)||(i.uniform1iv(this.addr,r),an(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ch(l0):a=o0;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function qS(i,e,t){let n=this.cache,s=e.length,r=Rh(t,s);rn(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||u0,r[a])}function XS(i,e,t){let n=this.cache,s=e.length,r=Rh(t,s);rn(n,r)||(i.uniform1iv(this.addr,r),an(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Ch(c0):a=d0;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function jS(i,e,t){let n=this.cache,s=e.length,r=Rh(t,s);rn(n,r)||(i.uniform1iv(this.addr,r),an(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||h0,r[a])}function KS(i){switch(i){case 5126:return CS;case 35664:return PS;case 35665:return IS;case 35666:return LS;case 35674:return DS;case 35675:return FS;case 35676:return NS;case 5124:case 35670:return US;case 35667:case 35671:return OS;case 35668:case 35672:return kS;case 35669:case 35673:return BS;case 5125:return zS;case 36294:return HS;case 36295:return GS;case 36296:return VS;case 35678:case 36198:case 36298:case 36306:case 35682:return WS;case 35679:case 36299:case 36307:return qS;case 35680:case 36300:case 36308:case 36293:return XS;case 36289:case 36303:case 36311:case 36292:return jS}}var of=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=RS(t.type)}},lf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=KS(t.type)}},cf=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},rf=/(\w+)(\])?(\[|\.)?/g;function qg(i,e){i.seq.push(e),i.map[e.id]=e}function YS(i,e,t){let n=i.name,s=n.length;for(rf.lastIndex=0;;){let r=rf.exec(n),a=rf.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){qg(t,c===void 0?new of(o,i,e):new lf(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new cf(o),qg(t,u)),t=u}}}var Oa=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);YS(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Xg(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var JS=37297,$S=0;function ZS(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var jg=new Ye;function QS(i){at._getMatrix(jg,at.workingColorSpace,i);let e=`mat3( ${jg.elements.map(t=>t.toFixed(4))} )`;switch(at.getTransfer(i)){case _o:return[e,"LinearTransferOETF"];case yt:return[e,"sRGBTransferOETF"];default:return ke("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Kg(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+ZS(i.getShaderSource(e),o)}else return r}function eM(i,e){let t=QS(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var tM={[Td]:"Linear",[Ed]:"Reinhard",[Ad]:"Cineon",[Rd]:"ACESFilmic",[Pd]:"AgX",[Id]:"Neutral",[Cd]:"Custom"};function nM(i,e){let t=tM[e];return t===void 0?(ke("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Eh=new C;function iM(){at.getLuminanceCoefficients(Eh);let i=Eh.x.toFixed(4),e=Eh.y.toFixed(4),t=Eh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sM(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qo).join(`
`)}function rM(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function aM(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Qo(i){return i!==""}function Yg(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Jg(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var oM=/^[ \t]*#include +<([\w\d./]+)>/gm;function hf(i){return i.replace(oM,lM)}function lM(i,e){let t=tt[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return hf(t)}var cM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $g(i){return i.replace(cM,hM)}function hM(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Zg(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var uM={[Vo]:"SHADOWMAP_TYPE_PCF",[Ia]:"SHADOWMAP_TYPE_VSM"};function dM(i){return uM[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var fM={[La]:"ENVMAP_MODE_REFRACTION"};function pM(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":fM[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var mM={[wd]:"ENVMAP_BLENDING_MULTIPLY",[mg]:"ENVMAP_BLENDING_MIX",[gg]:"ENVMAP_BLENDING_ADD"};function gM(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":mM[i.combine]||"ENVMAP_BLENDING_NONE"}function vM(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=dM(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=pM(t),u=gM(t),d=sM(t),p=rM(r),g=s.createProgram(),_,v,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Qo).join(`
`),_.length>0&&(_+=`
`),v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Qo).join(`
`),v.length>0&&(v+=`
`)):(_=[Zg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qo).join(`
`),v=[Zg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==oi?"#define TONE_MAPPING":"",t.toneMapping!==oi?tt.tonemapping_pars_fragment:"",t.toneMapping!==oi?nM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",tt.colorspace_pars_fragment,eM("linearToOutputTexel",t.outputColorSpace),iM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qo).join(`
`)),a=hf(a),a=Yg(a,t),a=Jg(a,t),o=hf(o),o=Yg(o,t),o=Jg(o,t),a=$g(a),o=$g(o),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,v=["#define varying in",t.glslVersion===Wd?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);let x=m+_+a,S=m+v+o,y=Xg(s,s.VERTEX_SHADER,x),R=Xg(s,s.FRAGMENT_SHADER,S);s.attachShader(g,y),s.attachShader(g,R),t.index0AttributeName!==void 0?s.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function M(I){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(g)||"",k=s.getShaderInfoLog(y)||"",V=s.getShaderInfoLog(R)||"",D=N.trim(),q=k.trim(),K=V.trim(),z=!0,se=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,y,R);else{let X=Kg(s,y,"vertex"),Y=Kg(s,R,"fragment");Ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+D+`
`+X+`
`+Y)}else D!==""?ke("WebGLProgram: Program Info Log:",D):(q===""||K==="")&&(se=!1);se&&(I.diagnostics={runnable:z,programLog:D,vertexShader:{log:q,prefix:_},fragmentShader:{log:K,prefix:v}})}s.deleteShader(y),s.deleteShader(R),b=new Oa(s,g),w=aM(s,g)}let b;this.getUniforms=function(){return b===void 0&&M(this),b};let w;this.getAttributes=function(){return w===void 0&&M(this),w};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(g,JS)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$S++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=y,this.fragmentShader=R,this}var bM=0,uf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new df(e),t.set(e,n)),n}},df=class{constructor(e){this.id=bM++,this.code=e,this.usedTimes=0}};function xM(i){return i===js||i===Yo||i===Jo}function yM(i,e,t,n,s,r){let a=new wo,o=new uf,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(b){return l.add(b),b===0?"uv":`uv${b}`}function g(b,w,L,I,N,k){let V=I.fog,D=N.geometry,q=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?I.environment:null,K=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,z=e.get(b.envMap||q,K),se=d[b.type],X=n.precision;b.precision!==null&&(X=n.getMaxPrecision(b.precision),X!==b.precision&&ke("WebGLProgram.getParameters:",b.precision,"not supported, using",X,"instead."));let Y=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,ee=Y!==void 0?Y.length:0,he=0;D.morphAttributes.position!==void 0&&(he=1),D.morphAttributes.normal!==void 0&&(he=2),D.morphAttributes.color!==void 0&&(he=3);let de,J,re,Se;if(se){let Ee=zi[se];de=Ee.vertexShader,J=Ee.fragmentShader}else{de=b.vertexShader,J=b.fragmentShader;let Ee=o.getVertexShaderStage(b),_t=o.getFragmentShaderStage(b);o.update(b,Ee,_t),re=Ee.id,Se=_t.id}let Ie=i.getRenderTarget(),le=i.state.buffers.depth.getReversed(),Xe=N.isInstancedMesh===!0,Mt=N.isBatchedMesh===!0,Oe=!!b.map,st=!!b.matcap,lt=!!z,rt=lt&&z.isPMREMTexture===!0,Yt=!!b.aoMap,Vt=!!b.lightMap,ln=!!b.bumpMap&&b.wireframe===!1,Ct=!!b.normalMap,Nn=!!b.displacementMap,Wt=!!b.emissiveMap,ei=!!b.metalnessMap,ti=!!b.roughnessMap,ni=b.anisotropy>0,B=b.clearcoat>0,ii=b.diffuseRoughness>0,Ut=b.dispersion>0,Ot=b.retroreflectivity>0,_e=b.iridescence>0,Qt=b.sheen>0,je=b.transmission>0,Je=ni&&!!b.anisotropyMap,P=B&&!!b.clearcoatMap,T=B&&!!b.clearcoatNormalMap,G=B&&!!b.clearcoatRoughnessMap,ae=ii&&!!b.diffuseRoughnessMap,ie=_e&&!!b.iridescenceMap,fe=_e&&!!b.iridescenceThicknessMap,be=Qt&&!!b.sheenColorMap,Q=Qt&&!!b.sheenRoughnessMap,te=!!b.specularMap,me=!!b.specularColorMap,F=!!b.specularIntensityMap,ne=je&&!!b.transmissionMap,$=je&&!!b.thicknessMap,ge=!!b.gradientMap,ue=!!b.alphaMap,pe=b.alphaTest>0,He=!!b.alphaHash,et=!!b.extensions,oe=oi;b.toneMapped&&(Ie===null||Ie.isXRRenderTarget===!0)&&(oe=i.toneMapping);let We=rt?z.isCompressedCubeTexture?z.image[0].mipmaps:z.mipmaps:null,Qe={shaderID:se,shaderType:b.type,shaderName:b.name,vertexShader:de,fragmentShader:J,defines:b.defines,customVertexShaderID:re,customFragmentShaderID:Se,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:X,batching:Mt,batchingColor:Mt&&N._colorsTexture!==null,instancing:Xe,instancingColor:Xe&&N.instanceColor!==null,instancingMorph:Xe&&N.morphTexture!==null,outputColorSpace:Ie===null?i.outputColorSpace:Ie.isXRRenderTarget===!0?Ie.texture.colorSpace:at.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:Oe,matcap:st,envMap:lt,envMapMode:lt&&z.mapping,envMapPMREM:rt,envMapMaxLod:rt?We.length-1:null,envMapSize:rt?We[0].width:null,aoMap:Yt,lightMap:Vt,bumpMap:ln,normalMap:Ct,displacementMap:Nn,emissiveMap:Wt,normalMapObjectSpace:Ct&&b.normalMapType===Sg,normalMapTangentSpace:Ct&&b.normalMapType===Sh,packedNormalMap:Ct&&b.normalMapType===Sh&&xM(b.normalMap.format),metalnessMap:ei,roughnessMap:ti,anisotropy:ni,anisotropyMap:Je,clearcoat:B,clearcoatMap:P,clearcoatNormalMap:T,clearcoatRoughnessMap:G,diffuseRoughness:ii,diffuseRoughnessMap:ae,dispersion:Ut,retroreflection:Ot,iridescence:_e,iridescenceMap:ie,iridescenceThicknessMap:fe,sheen:Qt,sheenColorMap:be,sheenRoughnessMap:Q,specularMap:te,specularColorMap:me,specularIntensityMap:F,transmission:je,transmissionMap:ne,thicknessMap:$,gradientMap:ge,opaque:b.transparent===!1&&b.blending===Xs&&b.alphaToCoverage===!1,alphaMap:ue,alphaTest:pe,alphaHash:He,combine:b.combine,mapUv:Oe&&p(b.map.channel),aoMapUv:Yt&&p(b.aoMap.channel),lightMapUv:Vt&&p(b.lightMap.channel),bumpMapUv:ln&&p(b.bumpMap.channel),normalMapUv:Ct&&p(b.normalMap.channel),displacementMapUv:Nn&&p(b.displacementMap.channel),emissiveMapUv:Wt&&p(b.emissiveMap.channel),metalnessMapUv:ei&&p(b.metalnessMap.channel),roughnessMapUv:ti&&p(b.roughnessMap.channel),anisotropyMapUv:Je&&p(b.anisotropyMap.channel),clearcoatMapUv:P&&p(b.clearcoatMap.channel),clearcoatNormalMapUv:T&&p(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:G&&p(b.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ae&&p(b.diffuseRoughnessMap.channel),iridescenceMapUv:ie&&p(b.iridescenceMap.channel),iridescenceThicknessMapUv:fe&&p(b.iridescenceThicknessMap.channel),sheenColorMapUv:be&&p(b.sheenColorMap.channel),sheenRoughnessMapUv:Q&&p(b.sheenRoughnessMap.channel),specularMapUv:te&&p(b.specularMap.channel),specularColorMapUv:me&&p(b.specularColorMap.channel),specularIntensityMapUv:F&&p(b.specularIntensityMap.channel),transmissionMapUv:ne&&p(b.transmissionMap.channel),thicknessMapUv:$&&p(b.thicknessMap.channel),alphaMapUv:ue&&p(b.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(Ct||ni),vertexNormals:!!D.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!D.attributes.uv&&(Oe||ue),fog:!!V,useFog:b.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||D.attributes.normal===void 0&&Ct===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:le,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:D.attributes.position!==void 0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:he,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:k.filter(Ee=>Ee.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:oe,decodeVideoTexture:Oe&&b.map.isVideoTexture===!0&&at.getTransfer(b.map.colorSpace)===yt,decodeVideoTextureEmissive:Wt&&b.emissiveMap.isVideoTexture===!0&&at.getTransfer(b.emissiveMap.colorSpace)===yt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===yn,flipSided:b.side===nn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:et&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(et&&b.extensions.multiDraw===!0||Mt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Qe.vertexUv1s=l.has(1),Qe.vertexUv2s=l.has(2),Qe.vertexUv3s=l.has(3),l.clear(),Qe}function _(b){let w=[];if(b.shaderID?w.push(b.shaderID):(w.push(b.customVertexShaderID),w.push(b.customFragmentShaderID)),b.defines!==void 0)for(let L in b.defines)w.push(L),w.push(b.defines[L]);return b.isRawShaderMaterial===!1&&(v(w,b),m(w,b),w.push(i.outputColorSpace)),w.push(b.customProgramCacheKey),w.join()}function v(b,w){b.push(w.precision),b.push(w.outputColorSpace),b.push(w.envMapMode),b.push(w.envMapPMREM),b.push(w.envMapMaxLod),b.push(w.envMapSize),b.push(w.mapUv),b.push(w.alphaMapUv),b.push(w.lightMapUv),b.push(w.aoMapUv),b.push(w.bumpMapUv),b.push(w.normalMapUv),b.push(w.displacementMapUv),b.push(w.emissiveMapUv),b.push(w.metalnessMapUv),b.push(w.roughnessMapUv),b.push(w.anisotropyMapUv),b.push(w.clearcoatMapUv),b.push(w.clearcoatNormalMapUv),b.push(w.clearcoatRoughnessMapUv),b.push(w.diffuseRoughnessMapUv),b.push(w.iridescenceMapUv),b.push(w.iridescenceThicknessMapUv),b.push(w.sheenColorMapUv),b.push(w.sheenRoughnessMapUv),b.push(w.specularMapUv),b.push(w.specularColorMapUv),b.push(w.specularIntensityMapUv),b.push(w.transmissionMapUv),b.push(w.thicknessMapUv),b.push(w.combine),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.morphTargetsCount),b.push(w.numSunLights),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numSpotLightMaps),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numSunLightShadows),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.numSpotLightShadowsWithMaps),b.push(w.numLightProbes),b.push(w.numLightProbeGrids),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.depthPacking)}function m(b,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.retroreflection&&a.enable(24),w.diffuseRoughness&&a.enable(25),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),b.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),b.push(a.mask)}function x(b){let w=d[b.type],L;if(w){let I=zi[w];L=Or.clone(I.uniforms)}else L=b.uniforms;return L}function S(b,w){let L=h.get(w);return L!==void 0?++L.usedTimes:(L=new vM(i,w,b,s),c.push(L),h.set(w,L)),L}function y(b){if(--b.usedTimes===0){let w=c.indexOf(b);c[w]=c[c.length-1],c.pop(),h.delete(b.cacheKey),b.destroy()}}function R(b){o.remove(b)}function M(){o.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:x,acquireProgram:S,releaseProgram:y,releaseShaderCache:R,programs:c,dispose:M}}function _M(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function SM(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Qg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function e0(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let p=0;return d.isInstancedMesh&&(p+=2),d.isSkinnedMesh&&(p+=1),p}function o(d,p,g,_,v,m){let x=i[e];return x===void 0?(x={id:d.id,object:d,geometry:p,material:g,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:v,group:m},i[e]=x):(x.id=d.id,x.object=d,x.geometry=p,x.material=g,x.materialVariant=a(d),x.groupOrder=_,x.renderOrder=d.renderOrder,x.z=v,x.group=m),e++,x}function l(d,p,g,_,v,m,x){x.reversedDepth===!0&&(v=-v);let S=o(d,p,g,_,v,m);g.transmission>0?n.push(S):g.transparent===!0?s.push(S):t.push(S)}function c(d,p,g,_,v,m){let x=o(d,p,g,_,v,m);g.transmission>0?n.unshift(x):g.transparent===!0?s.unshift(x):t.unshift(x)}function h(d,p){t.length>1&&t.sort(d||SM),n.length>1&&n.sort(p||Qg),s.length>1&&s.sort(p||Qg)}function u(){for(let d=e,p=i.length;d<p;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function MM(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new e0,i.set(n,[a])):s>=r.length?(a=new e0,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function wM(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new C,color:new Me};break;case"SpotLight":t={position:new C,direction:new C,color:new Me,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new Me,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new Me,groundColor:new Me};break;case"RectAreaLight":t={color:new Me,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function TM(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var EM=0;function AM(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function RM(i){let e=new wM,t=TM(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);let s=new C,r=new qe,a=new qe;function o(c){let h=0,u=0,d=0;for(let k=0;k<9;k++)n.probe[k].set(0,0,0);let p=0,g=0,_=0,v=0,m=0,x=0,S=0,y=0,R=0,M=0,b=0,w=0,L=0,I=0;c.sort(AM);for(let k=0,V=c.length;k<V;k++){let D=c[k],q=D.color,K=D.intensity,z=D.distance,se=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===js?se=D.shadow.map.texture:se=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=q.r*K,u+=q.g*K,d+=q.b*K;else if(D.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(D.sh.coefficients[X],K);I++}else if(D.isSunLight){let X=e.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Y=D.shadow,ee=t.get(D);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),n.sunShadow[g]=ee,n.sunShadowMap[g]=se;let he=Y.getViewportCount();for(let de=0;de<he;de++)n.sunShadowMatrix[_+de]=Y.getMatrix(de),n.sunShadowCascade[_+de]=Y._cascadeData[de];_+=he,g++}n.sun[p]=X,p++}else if(D.isDirectionalLight){let X=e.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Y=D.shadow,ee=t.get(D);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,n.directionalShadow[v]=ee,n.directionalShadowMap[v]=se,n.directionalShadowMatrix[v]=D.shadow.matrix,R++}n.directional[v]=X,v++}else if(D.isSpotLight){let X=e.get(D);X.position.setFromMatrixPosition(D.matrixWorld),X.color.copy(q).multiplyScalar(K),X.distance=z,X.coneCos=Math.cos(D.angle),X.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),X.decay=D.decay,n.spot[x]=X;let Y=D.shadow;if(D.map&&(n.spotLightMap[w]=D.map,w++,Y.updateMatrices(D),D.castShadow&&L++),n.spotLightMatrix[x]=Y.matrix,D.castShadow){let ee=t.get(D);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,n.spotShadow[x]=ee,n.spotShadowMap[x]=se,b++}x++}else if(D.isRectAreaLight){let X=e.get(D);X.color.copy(q).multiplyScalar(K),X.halfWidth.set(D.width*.5,0,0),X.halfHeight.set(0,D.height*.5,0),n.rectArea[S]=X,S++}else if(D.isPointLight){let X=e.get(D);if(X.color.copy(D.color).multiplyScalar(D.intensity),X.distance=D.distance,X.decay=D.decay,D.castShadow){let Y=D.shadow,ee=t.get(D);ee.shadowIntensity=Y.intensity,ee.shadowBias=Y.bias,ee.shadowNormalBias=Y.normalBias,ee.shadowRadius=Y.radius,ee.shadowMapSize=Y.mapSize,ee.shadowCameraNear=Y.camera.near,ee.shadowCameraFar=Y.camera.far,n.pointShadow[m]=ee,n.pointShadowMap[m]=se,n.pointShadowMatrix[m]=D.shadow.matrix,M++}n.point[m]=X,m++}else if(D.isHemisphereLight){let X=e.get(D);X.skyColor.copy(D.color).multiplyScalar(K),X.groundColor.copy(D.groundColor).multiplyScalar(K),n.hemi[y]=X,y++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ae.LTC_FLOAT_1,n.rectAreaLTC2=Ae.LTC_FLOAT_2):(n.rectAreaLTC1=Ae.LTC_HALF_1,n.rectAreaLTC2=Ae.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let N=n.hash;(N.sunLength!==p||N.directionalLength!==v||N.pointLength!==m||N.spotLength!==x||N.rectAreaLength!==S||N.hemiLength!==y||N.numSunShadows!==g||N.numDirectionalShadows!==R||N.numPointShadows!==M||N.numSpotShadows!==b||N.numSpotMaps!==w||N.numLightProbes!==I)&&(n.sun.length=p,n.directional.length=v,n.spot.length=x,n.rectArea.length=S,n.point.length=m,n.hemi.length=y,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=R,n.directionalShadowMap.length=R,n.directionalShadowMatrix.length=R,n.pointShadow.length=M,n.pointShadowMap.length=M,n.pointShadowMatrix.length=M,n.spotShadow.length=b,n.spotShadowMap.length=b,n.spotLightMatrix.length=b+w-L,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=L,n.numLightProbes=I,N.sunLength=p,N.directionalLength=v,N.pointLength=m,N.spotLength=x,N.rectAreaLength=S,N.hemiLength=y,N.numSunShadows=g,N.numDirectionalShadows=R,N.numPointShadows=M,N.numSpotShadows=b,N.numSpotMaps=w,N.numLightProbes=I,n.version=EM++)}function l(c,h){let u=0,d=0,p=0,g=0,_=0,v=0,m=h.matrixWorldInverse;for(let x=0,S=c.length;x<S;x++){let y=c[x];if(y.isSunLight){let R=n.sun[u];R.direction.setFromMatrixPosition(y.matrixWorld),R.direction.transformDirection(m),u++}else if(y.isDirectionalLight){let R=n.directional[d];R.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(m),d++}else if(y.isSpotLight){let R=n.spot[g];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(m),R.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(m),g++}else if(y.isRectAreaLight){let R=n.rectArea[_];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(m),a.identity(),r.copy(y.matrixWorld),r.premultiply(m),a.extractRotation(r),R.halfWidth.set(y.width*.5,0,0),R.halfHeight.set(0,y.height*.5,0),R.halfWidth.applyMatrix4(a),R.halfHeight.applyMatrix4(a),_++}else if(y.isPointLight){let R=n.point[p];R.position.setFromMatrixPosition(y.matrixWorld),R.position.applyMatrix4(m),p++}else if(y.isHemisphereLight){let R=n.hemi[v];R.direction.setFromMatrixPosition(y.matrixWorld),R.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function t0(i){let e=new RM(i),t=[],n=[],s=[];function r(u){h.camera=u,t.length=0,n.length=0,s.length=0}function a(u){u.isLightProbeGrid?s.push(u):t.push(u)}function o(u){n.push(u)}function l(){e.setup(t),s.sort((u,d)=>u.priority-d.priority||u.id-d.id)}function c(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function CM(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new t0(i),e.set(s,[o])):r>=a.length?(o=new t0(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var PM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,IM=`uniform sampler2D shadow_pass;
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
}`,LM=[new C(1,0,0),new C(-1,0,0),new C(0,1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1)],DM=[new C(0,-1,0),new C(0,-1,0),new C(0,0,1),new C(0,0,-1),new C(0,-1,0),new C(0,-1,0)],n0=new qe,Zo=new C,af=new C;function FM(i,e,t){let n=new Vs,s=new Be,r=new Be,a=new St,o=new _c,l=new Sc,c={},h=t.maxTextureSize,u={[Oi]:nn,[nn]:Oi,[yn]:yn},d=new Ft({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Be},radius:{value:4}},vertexShader:PM,fragmentShader:IM}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new Lt;g.setAttribute("position",new ut(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Et(g,d),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Vo;let m=this.type;this.render=function(M,b,w){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||M.length===0)return;this.type===Dc&&(ke("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Vo);let L=i.getRenderTarget(),I=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),k=i.state;k.setBlending(gs),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let V=m!==this.type;V&&b.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(q=>q.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,q=M.length;D<q;D++){let K=M[D],z=K.shadow;if(z===void 0){ke("WebGLShadowMap:",K,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let se=z.getFrameExtents();s.multiply(se),r.copy(z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/se.x),s.x=r.x*se.x,z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/se.y),s.y=r.y*se.y,z.mapSize.y=r.y));let X=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=X,z.map===null||V===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Ia){if(K.isPointLight){ke("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new jt(s.x,s.y,{format:js,type:sn,minFilter:Ht,magFilter:Ht,generateMipmaps:!1}),z.map.texture.name=K.name+".shadowMap",z.map.depthTexture=new ls(s.x,s.y,jn),z.map.depthTexture.name=K.name+".shadowMapDepth",z.map.depthTexture.format=ss,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Xt,z.map.depthTexture.magFilter=Xt}else K.isPointLight?(z.map=new el(s.x),z.map.depthTexture=new Io(s.x,Mi)):(z.map=new jt(s.x,s.y),z.map.depthTexture=new ls(s.x,s.y,Mi)),z.map.depthTexture.name=K.name+".shadowMap",z.map.depthTexture.format=ss,this.type===Vo?(z.map.depthTexture.compareFunction=X?Hd:zd,z.map.depthTexture.minFilter=Ht,z.map.depthTexture.magFilter=Ht):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Xt,z.map.depthTexture.magFilter=Xt);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);let Y=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();K.isPointLight!==!0&&z.updateMatrices(K,w);let ee=(z.camera.layers.mask&4294967294)!==0?z.camera.layers:w.layers;for(let he=0;he<Y;he++){let de=z.getCamera(he);if(K.isPointLight){let J=z.camera,re=z.matrix,Se=K.distance||J.far;Se!==J.far&&(J.far=Se,J.updateProjectionMatrix()),Zo.setFromMatrixPosition(K.matrixWorld),J.position.copy(Zo),af.copy(J.position),af.add(LM[he]),J.up.copy(DM[he]),J.lookAt(af),J.updateMatrixWorld(),re.makeTranslation(-Zo.x,-Zo.y,-Zo.z),n0.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),z._frustum.setFromProjectionMatrix(n0,J.coordinateSystem,J.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,he),i.clear();else{he===0&&(i.setRenderTarget(z.map),i.clear());let J=z.getViewport(he);a.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),k.viewport(a)}n=z.getFrustum(he),y(b,w,de,K,ee,this.type)}z.isPointLightShadow!==!0&&this.type===Ia&&x(z,w),z.needsUpdate=!1}m=this.type,v.needsUpdate=!1,i.setRenderTarget(L,I,N)};function x(M,b){let w=e.update(_);d.defines.VSM_SAMPLES!==M.blurSamples&&(d.defines.VSM_SAMPLES=M.blurSamples,p.defines.VSM_SAMPLES=M.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),M.mapPass===null?M.mapPass=new jt(s.x,s.y,{format:js,type:sn}):(M.mapPass.width!==M.map.width||M.mapPass.height!==M.map.height)&&M.mapPass.setSize(M.map.width,M.map.height),d.uniforms.shadow_pass.value=M.map.depthTexture,d.uniforms.resolution.value.set(M.map.width,M.map.height),d.uniforms.radius.value=M.radius,i.setRenderTarget(M.mapPass),i.clear(),i.renderBufferDirect(b,null,w,d,_,null),p.uniforms.shadow_pass.value=M.mapPass.texture,p.uniforms.resolution.value.set(M.map.width,M.map.height),p.uniforms.radius.value=M.radius,i.setRenderTarget(M.map),i.clear(),i.renderBufferDirect(b,null,w,p,_,null)}function S(M,b,w,L){let I=null,N=w.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(N!==void 0)I=N;else if(I=w.isPointLight===!0?l:o,i.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let k=I.uuid,V=b.uuid,D=c[k];D===void 0&&(D={},c[k]=D);let q=D[V];q===void 0&&(q=I.clone(),D[V]=q,b.addEventListener("dispose",R)),I=q}if(I.visible=b.visible,I.wireframe=b.wireframe,L===Ia?I.side=b.shadowSide!==null?b.shadowSide:b.side:I.side=b.shadowSide!==null?b.shadowSide:u[b.side],I.alphaMap=b.alphaMap,I.alphaTest=b.alphaToCoverage===!0?.5:b.alphaTest,I.map=b.map,I.clipShadows=b.clipShadows,I.clippingPlanes=b.clippingPlanes,I.clipIntersection=b.clipIntersection,I.displacementMap=b.displacementMap,I.displacementScale=b.displacementScale,I.displacementBias=b.displacementBias,I.wireframeLinewidth=b.wireframeLinewidth,I.linewidth=b.linewidth,w.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let k=i.properties.get(I);k.light=w}return I}function y(M,b,w,L,I,N){if(M.visible===!1)return;if(M.layers.test(I)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&N===Ia)&&(!M.frustumCulled||M.intersectsFrustum(n))){M.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,M.matrixWorld);let D=e.update(M),q=M.material;if(Array.isArray(q)){let K=D.groups;for(let z=0,se=K.length;z<se;z++){let X=K[z],Y=q[X.materialIndex];if(Y&&Y.visible){let ee=S(M,Y,L,N);M.onBeforeShadow(i,M,b,w,D,ee,X),i.renderBufferDirect(w,null,D,ee,M,X),M.onAfterShadow(i,M,b,w,D,ee,X)}}}else if(q.visible){let K=S(M,q,L,N);M.onBeforeShadow(i,M,b,w,D,K,null),i.renderBufferDirect(w,null,D,K,M,null),M.onAfterShadow(i,M,b,w,D,K,null)}}let V=M.children;for(let D=0,q=V.length;D<q;D++)y(V[D],b,w,L,I,N)}function R(M){M.target.removeEventListener("dispose",R);for(let w in c){let L=c[w],I=M.target.uuid;I in L&&(L[I].dispose(),delete L[I])}}}function NM(i,e){function t(){let F=!1,ne=new St,$=null,ge=new St(0,0,0,0);return{setMask:function(ue){$!==ue&&!F&&(i.colorMask(ue,ue,ue,ue),$=ue)},setLocked:function(ue){F=ue},setClear:function(ue,pe,He,et,oe){oe===!0&&(ue*=et,pe*=et,He*=et),ne.set(ue,pe,He,et),ge.equals(ne)===!1&&(i.clearColor(ue,pe,He,et),ge.copy(ne))},reset:function(){F=!1,$=null,ge.set(-1,0,0,0)}}}function n(){let F=!1,ne=!1,$=null,ge=null,ue=null;return{setReversed:function(pe){if(ne!==pe){let He=e.get("EXT_clip_control");pe?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),ne=pe;let et=ue;ue=null,this.setClear(et)}},getReversed:function(){return ne},setTest:function(pe){pe?le(i.DEPTH_TEST):Xe(i.DEPTH_TEST)},setMask:function(pe){$!==pe&&!F&&(i.depthMask(pe),$=pe)},setFunc:function(pe){if(ne&&(pe=Lg[pe]),ge!==pe){switch(pe){case ac:i.depthFunc(i.NEVER);break;case oc:i.depthFunc(i.ALWAYS);break;case lc:i.depthFunc(i.LESS);break;case fa:i.depthFunc(i.LEQUAL);break;case cc:i.depthFunc(i.EQUAL);break;case hc:i.depthFunc(i.GEQUAL);break;case uc:i.depthFunc(i.GREATER);break;case dc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=pe}},setLocked:function(pe){F=pe},setClear:function(pe){ue!==pe&&(ue=pe,ne&&(pe=1-pe),i.clearDepth(pe))},reset:function(){F=!1,$=null,ge=null,ue=null,ne=!1}}}function s(){let F=!1,ne=null,$=null,ge=null,ue=null,pe=null,He=null,et=null,oe=null;return{setTest:function(We){F||(We?le(i.STENCIL_TEST):Xe(i.STENCIL_TEST))},setMask:function(We){ne!==We&&!F&&(i.stencilMask(We),ne=We)},setFunc:function(We,Qe,Ee){($!==We||ge!==Qe||ue!==Ee)&&(i.stencilFunc(We,Qe,Ee),$=We,ge=Qe,ue=Ee)},setOp:function(We,Qe,Ee){(pe!==We||He!==Qe||et!==Ee)&&(i.stencilOp(We,Qe,Ee),pe=We,He=Qe,et=Ee)},setLocked:function(We){F=We},setClear:function(We){oe!==We&&(i.clearStencil(We),oe=We)},reset:function(){F=!1,ne=null,$=null,ge=null,ue=null,pe=null,He=null,et=null,oe=null}}}let r=new t,a=new n,o=new s,l={},c=new WeakMap,h={},u={},d={},p=new WeakMap,g=[],_=null,v=!1,m=null,x=null,S=null,y=null,R=null,M=null,b=null,w=new Me(0,0,0),L=0,I=!1,N=null,k=null,V=null,D=null,q=null,K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,se=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(X)[1]),z=se>=1):X.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),z=se>=2);let Y=null,ee={},he=i.getParameter(i.SCISSOR_BOX),de=i.getParameter(i.VIEWPORT),J=new St().fromArray(he),re=new St().fromArray(de);function Se(F,ne,$,ge){let ue=new Uint8Array(4),pe=i.createTexture();i.bindTexture(F,pe),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let He=0;He<$;He++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(ne,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,ue):i.texImage2D(ne+He,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ue);return pe}let Ie={};Ie[i.TEXTURE_2D]=Se(i.TEXTURE_2D,i.TEXTURE_2D,1),Ie[i.TEXTURE_CUBE_MAP]=Se(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ie[i.TEXTURE_2D_ARRAY]=Se(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ie[i.TEXTURE_3D]=Se(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),le(i.DEPTH_TEST),a.setFunc(fa),ln(!1),Ct(xd),le(i.CULL_FACE),Yt(gs);function le(F){h[F]!==!0&&(i.enable(F),h[F]=!0)}function Xe(F){h[F]!==!1&&(i.disable(F),h[F]=!1)}function Mt(F,ne){return d[F]!==ne?(i.bindFramebuffer(F,ne),d[F]=ne,F===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ne),F===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ne),!0):!1}function Oe(F,ne){let $=g,ge=!1;if(F){$=p.get(ne),$===void 0&&($=[],p.set(ne,$));let ue=F.textures;if($.length!==ue.length||$[0]!==i.COLOR_ATTACHMENT0){for(let pe=0,He=ue.length;pe<He;pe++)$[pe]=i.COLOR_ATTACHMENT0+pe;$.length=ue.length,ge=!0}}else $[0]!==i.BACK&&($[0]=i.BACK,ge=!0);ge&&i.drawBuffers($)}function st(F){return _!==F?(i.useProgram(F),_=F,!0):!1}let lt={[Lr]:i.FUNC_ADD,[Zm]:i.FUNC_SUBTRACT,[Qm]:i.FUNC_REVERSE_SUBTRACT};lt[eg]=i.MIN,lt[tg]=i.MAX;let rt={[ng]:i.ZERO,[ig]:i.ONE,[sg]:i.SRC_COLOR,[Sd]:i.SRC_ALPHA,[hg]:i.SRC_ALPHA_SATURATE,[lg]:i.DST_COLOR,[ag]:i.DST_ALPHA,[rg]:i.ONE_MINUS_SRC_COLOR,[Md]:i.ONE_MINUS_SRC_ALPHA,[cg]:i.ONE_MINUS_DST_COLOR,[og]:i.ONE_MINUS_DST_ALPHA,[ug]:i.CONSTANT_COLOR,[dg]:i.ONE_MINUS_CONSTANT_COLOR,[fg]:i.CONSTANT_ALPHA,[pg]:i.ONE_MINUS_CONSTANT_ALPHA};function Yt(F,ne,$,ge,ue,pe,He,et,oe,We){if(F===gs){v===!0&&(Xe(i.BLEND),v=!1);return}if(v===!1&&(le(i.BLEND),v=!0),F!==$m){if(F!==m||We!==I){if((x!==Lr||R!==Lr)&&(i.blendEquation(i.FUNC_ADD),x=Lr,R=Lr),We)switch(F){case Xs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Wo:i.blendFunc(i.ONE,i.ONE);break;case yd:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _d:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ke("WebGLState: Invalid blending: ",F);break}else switch(F){case Xs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Wo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case yd:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _d:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",F);break}S=null,y=null,M=null,b=null,w.set(0,0,0),L=0,m=F,I=We}return}ue=ue||ne,pe=pe||$,He=He||ge,(ne!==x||ue!==R)&&(i.blendEquationSeparate(lt[ne],lt[ue]),x=ne,R=ue),($!==S||ge!==y||pe!==M||He!==b)&&(i.blendFuncSeparate(rt[$],rt[ge],rt[pe],rt[He]),S=$,y=ge,M=pe,b=He),(et.equals(w)===!1||oe!==L)&&(i.blendColor(et.r,et.g,et.b,oe),w.copy(et),L=oe),m=F,I=!1}function Vt(F,ne){F.side===yn?Xe(i.CULL_FACE):le(i.CULL_FACE);let $=F.side===nn;ne&&($=!$),ln($),F.blending===Xs&&F.transparent===!1?Yt(gs):Yt(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let ge=F.stencilWrite;o.setTest(ge),ge&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Wt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):Xe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ln(F){N!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),N=F)}function Ct(F){F!==Ym?(le(i.CULL_FACE),F!==k&&(F===xd?i.cullFace(i.BACK):F===Jm?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Xe(i.CULL_FACE),k=F}function Nn(F){F!==V&&(z&&i.lineWidth(F),V=F)}function Wt(F,ne,$){F?(le(i.POLYGON_OFFSET_FILL),(D!==ne||q!==$)&&(D=ne,q=$,a.getReversed()&&(ne=-ne,$=-$),i.polygonOffset(ne,$))):Xe(i.POLYGON_OFFSET_FILL)}function ei(F){F?le(i.SCISSOR_TEST):Xe(i.SCISSOR_TEST)}function ti(F){F===void 0&&(F=i.TEXTURE0+K-1),Y!==F&&(i.activeTexture(F),Y=F)}function ni(F,ne,$){$===void 0&&(Y===null?$=i.TEXTURE0+K-1:$=Y);let ge=ee[$];ge===void 0&&(ge={type:void 0,texture:void 0},ee[$]=ge),(ge.type!==F||ge.texture!==ne)&&(Y!==$&&(i.activeTexture($),Y=$),i.bindTexture(F,ne||Ie[F]),ge.type=F,ge.texture=ne)}function B(){let F=ee[Y];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ii(){try{i.compressedTexImage2D(...arguments)}catch(F){Ke("WebGLState:",F)}}function Ut(){try{i.compressedTexImage3D(...arguments)}catch(F){Ke("WebGLState:",F)}}function Ot(){try{i.texSubImage2D(...arguments)}catch(F){Ke("WebGLState:",F)}}function _e(){try{i.texSubImage3D(...arguments)}catch(F){Ke("WebGLState:",F)}}function Qt(){try{i.compressedTexSubImage2D(...arguments)}catch(F){Ke("WebGLState:",F)}}function je(){try{i.compressedTexSubImage3D(...arguments)}catch(F){Ke("WebGLState:",F)}}function Je(){try{i.texStorage2D(...arguments)}catch(F){Ke("WebGLState:",F)}}function P(){try{i.texStorage3D(...arguments)}catch(F){Ke("WebGLState:",F)}}function T(){try{i.texImage2D(...arguments)}catch(F){Ke("WebGLState:",F)}}function G(){try{i.texImage3D(...arguments)}catch(F){Ke("WebGLState:",F)}}function ae(F){return u[F]!==void 0?u[F]:i.getParameter(F)}function ie(F,ne){u[F]!==ne&&(i.pixelStorei(F,ne),u[F]=ne)}function fe(F){J.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),J.copy(F))}function be(F){re.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),re.copy(F))}function Q(F,ne){let $=c.get(ne);$===void 0&&($=new WeakMap,c.set(ne,$));let ge=$.get(F);ge===void 0&&(ge=i.getUniformBlockIndex(ne,F.name),i.uniformBlockBinding(ne,ge,ge),$.set(F,ge))}function te(F,ne,$){let ue=c.get(ne).get(F);l[ue]!==$&&(i.bindBufferBase(i.UNIFORM_BUFFER,ue,$),l[ue]=$)}function me(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},Y=null,ee={},d={},l={},p=new WeakMap,g=[],_=null,v=!1,m=null,x=null,S=null,y=null,R=null,M=null,b=null,w=new Me(0,0,0),L=0,I=!1,N=null,k=null,V=null,D=null,q=null,J.set(0,0,i.canvas.width,i.canvas.height),re.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:le,disable:Xe,bindFramebuffer:Mt,drawBuffers:Oe,useProgram:st,setBlending:Yt,setMaterial:Vt,setFlipSided:ln,setCullFace:Ct,setLineWidth:Nn,setPolygonOffset:Wt,setScissorTest:ei,activeTexture:ti,bindTexture:ni,unbindTexture:B,compressedTexImage2D:ii,compressedTexImage3D:Ut,texImage2D:T,texImage3D:G,pixelStorei:ie,getParameter:ae,updateUBOMapping:Q,uniformBlockBinding:te,texStorage2D:Je,texStorage3D:P,texSubImage2D:Ot,texSubImage3D:_e,compressedTexSubImage2D:Qt,compressedTexSubImage3D:je,scissor:fe,viewport:be,reset:me}}function UM(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Be,h=new WeakMap,u=new Set,d,p=new WeakMap,g=new Set,_=new FinalizationRegistry(P=>g.delete(P)),v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,T){return v?new OffscreenCanvas(P,T):ga("canvas")}function x(P,T,G){let ae=1,ie=Je(P);if((ie.width>G||ie.height>G)&&(ae=G/Math.max(ie.width,ie.height)),ae<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let fe=Math.floor(ae*ie.width),be=Math.floor(ae*ie.height);d===void 0&&(d=m(fe,be));let Q=T?m(fe,be):d;return Q.width=fe,Q.height=be,Q.getContext("2d").drawImage(P,0,0,fe,be),ke("WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+fe+"x"+be+")."),Q}else return"data"in P&&ke("WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),P;return P}function S(P){return P.generateMipmaps}function y(P){i.generateMipmap(P)}function R(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(P,T,G,ae,ie,fe=!1){if(P!==null){if(i[P]!==void 0)return i[P];ke("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let be;ae&&(be=e.get("EXT_texture_norm16"),be||ke("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=T;if(T===i.RED&&(G===i.FLOAT&&(Q=i.R32F),G===i.HALF_FLOAT&&(Q=i.R16F),G===i.UNSIGNED_BYTE&&(Q=i.R8),G===i.UNSIGNED_SHORT&&be&&(Q=be.R16_EXT),G===i.SHORT&&be&&(Q=be.R16_SNORM_EXT)),T===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.R8UI),G===i.UNSIGNED_SHORT&&(Q=i.R16UI),G===i.UNSIGNED_INT&&(Q=i.R32UI),G===i.BYTE&&(Q=i.R8I),G===i.SHORT&&(Q=i.R16I),G===i.INT&&(Q=i.R32I)),T===i.RG&&(G===i.FLOAT&&(Q=i.RG32F),G===i.HALF_FLOAT&&(Q=i.RG16F),G===i.UNSIGNED_BYTE&&(Q=i.RG8),G===i.UNSIGNED_SHORT&&be&&(Q=be.RG16_EXT),G===i.SHORT&&be&&(Q=be.RG16_SNORM_EXT)),T===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RG8UI),G===i.UNSIGNED_SHORT&&(Q=i.RG16UI),G===i.UNSIGNED_INT&&(Q=i.RG32UI),G===i.BYTE&&(Q=i.RG8I),G===i.SHORT&&(Q=i.RG16I),G===i.INT&&(Q=i.RG32I)),T===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),G===i.UNSIGNED_INT&&(Q=i.RGB32UI),G===i.BYTE&&(Q=i.RGB8I),G===i.SHORT&&(Q=i.RGB16I),G===i.INT&&(Q=i.RGB32I)),T===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),G===i.UNSIGNED_INT&&(Q=i.RGBA32UI),G===i.BYTE&&(Q=i.RGBA8I),G===i.SHORT&&(Q=i.RGBA16I),G===i.INT&&(Q=i.RGBA32I)),T===i.RGB&&(G===i.UNSIGNED_SHORT&&be&&(Q=be.RGB16_EXT),G===i.SHORT&&be&&(Q=be.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),T===i.RGBA){let te=fe?_o:at.getTransfer(ie);G===i.FLOAT&&(Q=i.RGBA32F),G===i.HALF_FLOAT&&(Q=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Q=te===yt?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&be&&(Q=be.RGBA16_EXT),G===i.SHORT&&be&&(Q=be.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function b(P,T){let G;return P?T===null||T===Mi||T===Nr?G=i.DEPTH24_STENCIL8:T===jn?G=i.DEPTH32F_STENCIL8:T===Fa&&(G=i.DEPTH24_STENCIL8,ke("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===Mi||T===Nr?G=i.DEPTH_COMPONENT24:T===jn?G=i.DEPTH_COMPONENT32F:T===Fa&&(G=i.DEPTH_COMPONENT16),G}function w(P,T){return S(P)===!0||P.isFramebufferTexture&&P.minFilter!==Xt&&P.minFilter!==Ht?Math.log2(Math.max(T.width,T.height))+1:P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?T.mipmaps.length:1}function L(P){let T=new WeakRef(P);n.get(P).__ref=T,g.add(T),_.register(P,T,T)}function I(P){let T=n.get(P).__ref;T!==void 0&&(g.delete(T),_.unregister(T))}function N(P){V(P.target)}function k(P){D(P.target)}function V(P){P.removeEventListener("dispose",N),I(P),K(P),P.isVideoTexture&&h.delete(P),P.isHTMLTexture&&u.delete(P)}function D(P){P.removeEventListener("dispose",k),I(P),se(P)}function q(){for(let P of g){let T=P.deref();T!==void 0&&(T.isRenderTarget===!0?D(T):V(T))}g.clear(),u.clear()}function K(P){let T=n.get(P);if(T.__webglInit===void 0)return;let G=P.source,ae=p.get(G);if(ae){let ie=ae[T.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&z(P),Object.keys(ae).length===0&&p.delete(G)}n.remove(P)}function z(P){let T=n.get(P);i.deleteTexture(T.__webglTexture);let G=P.source,ae=p.get(G);delete ae[T.__cacheKey],a.memory.textures--}function se(P){let T=n.get(P);T.__depthDisposeCallback&&T.__depthDisposeCallback();let G=P.depthTexture;if(G&&G.renderTarget===P&&V(G),P.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++){if(Array.isArray(T.__webglFramebuffer[ie]))for(let fe=0;fe<T.__webglFramebuffer[ie].length;fe++)i.deleteFramebuffer(T.__webglFramebuffer[ie][fe]);else i.deleteFramebuffer(T.__webglFramebuffer[ie]);T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer[ie])}else{if(Array.isArray(T.__webglFramebuffer))for(let ie=0;ie<T.__webglFramebuffer.length;ie++)i.deleteFramebuffer(T.__webglFramebuffer[ie]);else i.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&i.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let ie=0;ie<T.__webglColorRenderbuffer.length;ie++)T.__webglColorRenderbuffer[ie]&&i.deleteRenderbuffer(T.__webglColorRenderbuffer[ie]);T.__webglDepthRenderbuffer&&i.deleteRenderbuffer(T.__webglDepthRenderbuffer)}let ae=P.textures;for(let ie=0,fe=ae.length;ie<fe;ie++){let be=n.get(ae[ie]);be.__webglTexture&&(i.deleteTexture(be.__webglTexture),a.memory.textures--),n.remove(ae[ie])}n.remove(P)}let X=0;function Y(){X=0}function ee(){return X}function he(P){X=P}function de(){let P=X;return P>=s.maxTextures&&ke("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+s.maxTextures),X+=1,P}function J(P){let T=[];return T.push(P.wrapS),T.push(P.wrapT),T.push(P.wrapR||0),T.push(P.magFilter),T.push(P.minFilter),T.push(P.anisotropy),T.push(P.internalFormat),T.push(P.format),T.push(P.type),T.push(P.generateMipmaps),T.push(P.mipmapsAutoUpdate),T.push(P.premultiplyAlpha),T.push(P.flipY),T.push(P.unpackAlignment),T.push(P.colorSpace),T.join()}function re(P,T){let G=n.get(P);if(P.isVideoTexture&&Qt(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&G.__version!==P.version){let ae=P.image;if(ae===null)ke("WebGLRenderer: Texture marked for update but no image data found.");else if(ae.complete===!1)ke("WebGLRenderer: Texture marked for update but image is incomplete");else{Vt(G,P,T);return}}else P.isExternalTexture&&(G.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+T)}function Se(P,T){let G=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&G.__version!==P.version){Vt(G,P,T);return}else P.isExternalTexture&&(G.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+T)}function Ie(P,T){let G=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&G.__version!==P.version){Vt(G,P,T);return}t.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+T)}function le(P,T){let G=n.get(P);if(P.version>0&&G.__version!==P.version){ln(G,P,T);return}t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+T)}let Xe={[Fi]:i.REPEAT,[ri]:i.CLAMP_TO_EDGE,[pa]:i.MIRRORED_REPEAT},Mt={[Xt]:i.NEAREST,[Uc]:i.NEAREST_MIPMAP_NEAREST,[Fr]:i.NEAREST_MIPMAP_LINEAR,[Ht]:i.LINEAR,[Da]:i.LINEAR_MIPMAP_NEAREST,[_n]:i.LINEAR_MIPMAP_LINEAR},Oe={[wg]:i.NEVER,[Gd]:i.ALWAYS,[Tg]:i.LESS,[zd]:i.LEQUAL,[Eg]:i.EQUAL,[Hd]:i.GEQUAL,[Ag]:i.GREATER,[Rg]:i.NOTEQUAL};function st(P,T){if(T.type===jn&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===Ht||T.magFilter===Da||T.magFilter===Fr||T.magFilter===_n||T.minFilter===Ht||T.minFilter===Da||T.minFilter===Fr||T.minFilter===_n)&&ke("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,Xe[T.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,Xe[T.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,Xe[T.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,Mt[T.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,Mt[T.minFilter]),T.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,Oe[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Xt||T.minFilter!==Fr&&T.minFilter!==_n||T.type===jn&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){let G=e.get("EXT_texture_filter_anisotropic");i.texParameterf(P,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function lt(P,T){let G=!1;P.__webglInit===void 0&&(P.__webglInit=!0,T.addEventListener("dispose",N),L(T));let ae=T.source,ie=p.get(ae);ie===void 0&&(ie={},p.set(ae,ie));let fe=J(T);if(fe!==P.__cacheKey){ie[fe]===void 0&&(ie[fe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,G=!0),ie[fe].usedTimes++;let be=ie[P.__cacheKey];be!==void 0&&(ie[P.__cacheKey].usedTimes--,be.usedTimes===0&&z(T)),P.__cacheKey=fe,P.__webglTexture=ie[fe].texture}return G}function rt(P,T,G){return Math.floor(Math.floor(P/G)/T)}function Yt(P,T,G,ae){let fe=P.updateRanges;if(fe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,T.width,T.height,G,ae,T.data);else{fe.sort((F,ne)=>F.start-ne.start);let be=0;for(let F=1;F<fe.length;F++){let ne=fe[be],$=fe[F],ge=ne.start+ne.count,ue=rt($.start,T.width,4),pe=rt(ne.start,T.width,4);$.start<=ge+1&&ue===pe&&rt($.start+$.count-1,T.width,4)===ue?ne.count=Math.max(ne.count,$.start+$.count-ne.start):(++be,fe[be]=$)}fe.length=be+1;let Q=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),me=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,T.width);for(let F=0,ne=fe.length;F<ne;F++){let $=fe[F],ge=Math.floor($.start/4),ue=Math.ceil($.count/4),pe=ge%T.width,He=Math.floor(ge/T.width),et=ue,oe=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,pe),t.pixelStorei(i.UNPACK_SKIP_ROWS,He),t.texSubImage2D(i.TEXTURE_2D,0,pe,He,et,oe,G,ae,T.data)}P.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,me)}}function Vt(P,T,G){let ae=i.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(ae=i.TEXTURE_2D_ARRAY),T.isData3DTexture&&(ae=i.TEXTURE_3D);let ie=lt(P,T),fe=T.source;t.bindTexture(ae,P.__webglTexture,i.TEXTURE0+G);let be=n.get(fe);if(fe.version!==be.__version||ie===!0){if(t.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap<"u"&&T.image instanceof ImageBitmap)===!1){let oe=at.getPrimaries(at.workingColorSpace),We=T.colorSpace===li?null:at.getPrimaries(T.colorSpace),Qe=T.colorSpace===li||oe===We?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Qe)}t.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment);let te=x(T.image,!1,s.maxTextureSize);te=je(T,te);let me=r.convert(T.format,T.colorSpace),F=r.convert(T.type),ne=M(T.internalFormat,me,F,T.normalized,T.colorSpace,T.isVideoTexture);st(ae,T);let $,ge=T.mipmaps,ue=T.isVideoTexture!==!0,pe=be.__version===void 0||ie===!0,He=fe.dataReady,et=w(T,te);if(T.isDepthTexture)ne=b(T.format===vs,T.type),pe&&(ue?t.texStorage2D(i.TEXTURE_2D,1,ne,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,ne,te.width,te.height,0,me,F,null));else if(T.isDataTexture)if(ge.length>0){ue&&pe&&t.texStorage2D(i.TEXTURE_2D,et,ne,ge[0].width,ge[0].height);for(let oe=0,We=ge.length;oe<We;oe++)$=ge[oe],ue?He&&t.texSubImage2D(i.TEXTURE_2D,oe,0,0,$.width,$.height,me,F,$.data):t.texImage2D(i.TEXTURE_2D,oe,ne,$.width,$.height,0,me,F,$.data);T.generateMipmaps=!1}else ue?(pe&&t.texStorage2D(i.TEXTURE_2D,et,ne,te.width,te.height),He&&Yt(T,te,me,F)):t.texImage2D(i.TEXTURE_2D,0,ne,te.width,te.height,0,me,F,te.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){ue&&pe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,et,ne,ge[0].width,ge[0].height,te.depth);for(let oe=0,We=ge.length;oe<We;oe++)if($=ge[oe],T.format!==Bn)if(me!==null)if(ue){if(He)if(T.layerUpdates.size>0){let Qe=Zd($.width,$.height,T.format,T.type);for(let Ee of T.layerUpdates){let _t=$.data.subarray(Ee*Qe/$.data.BYTES_PER_ELEMENT,(Ee+1)*Qe/$.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,oe,0,0,Ee,$.width,$.height,1,me,_t)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,oe,0,0,0,$.width,$.height,te.depth,me,$.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,oe,ne,$.width,$.height,te.depth,0,$.data,0,0);else ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ue?He&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,oe,0,0,0,$.width,$.height,te.depth,me,F,$.data):t.texImage3D(i.TEXTURE_2D_ARRAY,oe,ne,$.width,$.height,te.depth,0,me,F,$.data);T.layerUpdates.size>0&&T.clearLayerUpdates()}else{ue&&pe&&t.texStorage2D(i.TEXTURE_2D,et,ne,ge[0].width,ge[0].height);for(let oe=0,We=ge.length;oe<We;oe++)$=ge[oe],T.format!==Bn?me!==null?ue?He&&t.compressedTexSubImage2D(i.TEXTURE_2D,oe,0,0,$.width,$.height,me,$.data):t.compressedTexImage2D(i.TEXTURE_2D,oe,ne,$.width,$.height,0,$.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ue?He&&t.texSubImage2D(i.TEXTURE_2D,oe,0,0,$.width,$.height,me,F,$.data):t.texImage2D(i.TEXTURE_2D,oe,ne,$.width,$.height,0,me,F,$.data)}else if(T.isDataArrayTexture)if(ue){if(pe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,et,ne,te.width,te.height,te.depth),He)if(T.layerUpdates.size>0){let oe=Zd(te.width,te.height,T.format,T.type);for(let We of T.layerUpdates){let Qe=te.data.subarray(We*oe/te.data.BYTES_PER_ELEMENT,(We+1)*oe/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,We,te.width,te.height,1,me,F,Qe)}T.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,F,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ne,te.width,te.height,te.depth,0,me,F,te.data);else if(T.isData3DTexture)ue?(pe&&t.texStorage3D(i.TEXTURE_3D,et,ne,te.width,te.height,te.depth),He&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,F,te.data)):t.texImage3D(i.TEXTURE_3D,0,ne,te.width,te.height,te.depth,0,me,F,te.data);else if(T.isFramebufferTexture){if(pe)if(ue)t.texStorage2D(i.TEXTURE_2D,et,ne,te.width,te.height);else{let oe=te.width,We=te.height;for(let Qe=0;Qe<et;Qe++)t.texImage2D(i.TEXTURE_2D,Qe,ne,oe,We,0,me,F,null),oe>>=1,We>>=1}}else if(T.isHTMLTexture){if("texElementImage2D"in i){let oe=i.canvas;if(oe.hasAttribute("layoutsubtree")||oe.setAttribute("layoutsubtree","true"),te.parentNode!==oe){oe.appendChild(te),u.add(T),oe.onpaint=We=>{let Qe=We.changedElements;for(let Ee of u)Qe.includes(Ee.image)&&(Ee.needsUpdate=!0)},oe.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let Qe=i.RGBA,Ee=i.RGBA,_t=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Qe,Ee,_t,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ge.length>0){if(ue&&pe){let oe=Je(ge[0]);t.texStorage2D(i.TEXTURE_2D,et,ne,oe.width,oe.height)}for(let oe=0,We=ge.length;oe<We;oe++)$=ge[oe],ue?He&&t.texSubImage2D(i.TEXTURE_2D,oe,0,0,me,F,$):t.texImage2D(i.TEXTURE_2D,oe,ne,me,F,$);T.generateMipmaps=!1}else if(ue){if(pe){let oe=Je(te);t.texStorage2D(i.TEXTURE_2D,et,ne,oe.width,oe.height)}He&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,F,te)}else t.texImage2D(i.TEXTURE_2D,0,ne,me,F,te);S(T)&&T.mipmapsAutoUpdate===!0&&y(ae),be.__version=fe.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function ln(P,T,G){if(T.image.length!==6)return;let ae=lt(P,T),ie=T.source;t.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+G);let fe=n.get(ie);if(ie.version!==fe.__version||ae===!0){t.activeTexture(i.TEXTURE0+G);let be=at.getPrimaries(at.workingColorSpace),Q=T.colorSpace===li?null:at.getPrimaries(T.colorSpace),te=T.colorSpace===li||be===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let me=T.isCompressedTexture||T.image[0].isCompressedTexture,F=T.image[0]&&T.image[0].isDataTexture,ne=[];for(let Ee=0;Ee<6;Ee++)!me&&!F?ne[Ee]=x(T.image[Ee],!0,s.maxCubemapSize):ne[Ee]=F?T.image[Ee].image:T.image[Ee],ne[Ee]=je(T,ne[Ee]);let $=ne[0],ge=r.convert(T.format,T.colorSpace),ue=r.convert(T.type),pe=M(T.internalFormat,ge,ue,T.normalized,T.colorSpace),He=T.isVideoTexture!==!0,et=fe.__version===void 0||ae===!0,oe=ie.dataReady,We=w(T,$);st(i.TEXTURE_CUBE_MAP,T);let Qe;if(T.isDepthTexture){if(pe=b(T.format===vs,T.type),et)if(He)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,pe,$.width,$.height);else for(let Ee=0;Ee<6;Ee++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,pe,$.width,$.height,0,ge,ue,null)}else if(me){He&&et&&t.texStorage2D(i.TEXTURE_CUBE_MAP,We,pe,$.width,$.height);for(let Ee=0;Ee<6;Ee++){Qe=ne[Ee].mipmaps;for(let _t=0;_t<Qe.length;_t++){let cn=Qe[_t];T.format!==Bn?ge!==null?He?oe&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t,0,0,cn.width,cn.height,ge,cn.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t,pe,cn.width,cn.height,0,cn.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):He?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t,0,0,cn.width,cn.height,ge,ue,cn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t,pe,cn.width,cn.height,0,ge,ue,cn.data)}}}else{if(Qe=T.mipmaps,He&&et){Qe.length>0&&We++;let Ee=Je(ne[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,We,pe,Ee.width,Ee.height)}for(let Ee=0;Ee<6;Ee++)if(F){He?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,0,0,ne[Ee].width,ne[Ee].height,ge,ue,ne[Ee].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,pe,ne[Ee].width,ne[Ee].height,0,ge,ue,ne[Ee].data);for(let _t=0;_t<Qe.length;_t++){let Ds=Qe[_t].image[Ee].image;He?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t+1,0,0,Ds.width,Ds.height,ge,ue,Ds.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t+1,pe,Ds.width,Ds.height,0,ge,ue,Ds.data)}}else{He?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,0,0,ge,ue,ne[Ee]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,pe,ge,ue,ne[Ee]);for(let _t=0;_t<Qe.length;_t++){let cn=Qe[_t];He?oe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t+1,0,0,ge,ue,cn.image[Ee]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,_t+1,pe,ge,ue,cn.image[Ee])}}}S(T)&&T.mipmapsAutoUpdate===!0&&y(i.TEXTURE_CUBE_MAP),fe.__version=ie.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function Ct(P,T,G,ae,ie,fe){let be=r.convert(G.format,G.colorSpace),Q=r.convert(G.type),te=M(G.internalFormat,be,Q,G.normalized,G.colorSpace),me=n.get(T),F=n.get(G);if(F.__renderTarget=T,!me.__hasExternalTextures){let ne=Math.max(1,T.width>>fe),$=Math.max(1,T.height>>fe);ie===i.TEXTURE_3D||ie===i.TEXTURE_2D_ARRAY?t.texImage3D(ie,fe,te,ne,$,T.depth,0,be,Q,null):t.texImage2D(ie,fe,te,ne,$,0,be,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,P),_e(T)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ae,ie,F.__webglTexture,0,Ot(T)):(ie===i.TEXTURE_2D||ie>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ae,ie,F.__webglTexture,fe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Nn(P,T,G){if(i.bindRenderbuffer(i.RENDERBUFFER,P),T.depthBuffer){let ae=T.depthTexture,ie=ae&&ae.isDepthTexture?ae.type:null,fe=b(T.stencilBuffer,ie),be=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;_e(T)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ot(T),fe,T.width,T.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot(T),fe,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,fe,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,P)}else{let ae=T.textures;for(let ie=0;ie<ae.length;ie++){let fe=ae[ie],be=r.convert(fe.format,fe.colorSpace),Q=r.convert(fe.type),te=M(fe.internalFormat,be,Q,fe.normalized,fe.colorSpace);_e(T)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ot(T),te,T.width,T.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot(T),te,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,te,T.width,T.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Wt(P,T,G){let ae=T.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,P),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ie=n.get(T.depthTexture);ie.__renderTarget=T;let fe=ae?T.depthTexture.image[0]:T.depthTexture.image;(!ie.__webglTexture||fe.width!==T.width||fe.height!==T.height)&&(fe.width=T.width,fe.height=T.height,T.depthTexture.needsUpdate=!0),ae?le(T.depthTexture,0):re(T.depthTexture,0);let be=ie.__webglTexture,Q=Ot(T),te=ae?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,me=T.depthTexture.format===vs?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(T.depthTexture.format===ss)_e(T)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,te,be,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,me,te,be,0);else if(T.depthTexture.format===vs)_e(T)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,te,be,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,me,te,be,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ei(P){let T=n.get(P),G=P.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==P.depthTexture){let ae=P.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),ae){let ie=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,ae.removeEventListener("dispose",ie)};ae.addEventListener("dispose",ie),T.__depthDisposeCallback=ie}T.__boundDepthTexture=ae}if(P.depthTexture&&!T.__autoAllocateDepthBuffer)if(G)for(let ae=0;ae<6;ae++)Wt(T.__webglFramebuffer[ae],P,ae);else P.texture.mipmaps.length>0?Wt(T.__webglFramebuffer[0],P,0):Wt(T.__webglFramebuffer,P,0);else if(G){T.__webglDepthbuffer=[];for(let ae=0;ae<6;ae++)if(t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[ae]),T.__webglDepthbuffer[ae]===void 0)T.__webglDepthbuffer[ae]=i.createRenderbuffer(),Nn(T.__webglDepthbuffer[ae],P,!1);else{let ie=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=T.__webglDepthbuffer[ae];i.bindRenderbuffer(i.RENDERBUFFER,fe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,fe)}}else if(P.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=i.createRenderbuffer(),Nn(T.__webglDepthbuffer,P,!1);else{let ie=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=T.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,fe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ie,i.RENDERBUFFER,fe)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ti(P,T,G){let ae=n.get(P);T!==void 0&&Ct(ae.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&ei(P)}function ni(P){let T=P.texture,G=n.get(P),ae=n.get(T);P.addEventListener("dispose",k),L(P);let ie=P.textures,fe=P.isWebGLCubeRenderTarget===!0,be=ie.length>1;if(be||(ae.__webglTexture===void 0&&(ae.__webglTexture=i.createTexture()),ae.__version=T.version,a.memory.textures++),fe){G.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(T.mipmaps.length>0){G.__webglFramebuffer[Q]=[];for(let te=0;te<T.mipmaps.length;te++)G.__webglFramebuffer[Q][te]=i.createFramebuffer()}else G.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(T.mipmaps.length>0){G.__webglFramebuffer=[];for(let Q=0;Q<T.mipmaps.length;Q++)G.__webglFramebuffer[Q]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(be)for(let Q=0,te=ie.length;Q<te;Q++){let me=n.get(ie[Q]);me.__webglTexture===void 0&&(me.__webglTexture=i.createTexture(),a.memory.textures++)}if(P.samples>0&&_e(P)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Q=0;Q<ie.length;Q++){let te=ie[Q];G.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[Q]);let me=r.convert(te.format,te.colorSpace),F=r.convert(te.type),ne=M(te.internalFormat,me,F,te.normalized,te.colorSpace,P.isXRRenderTarget===!0),$=Ot(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,$,ne,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,G.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),Nn(G.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(fe){t.bindTexture(i.TEXTURE_CUBE_MAP,ae.__webglTexture),st(i.TEXTURE_CUBE_MAP,T);for(let Q=0;Q<6;Q++)if(T.mipmaps.length>0)for(let te=0;te<T.mipmaps.length;te++)Ct(G.__webglFramebuffer[Q][te],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,te);else Ct(G.__webglFramebuffer[Q],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);S(T)?y(i.TEXTURE_CUBE_MAP):T.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,T.mipmaps.length-1),t.unbindTexture()}else if(be){for(let Q=0,te=ie.length;Q<te;Q++){let me=ie[Q],F=n.get(me),ne=i.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(ne=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ne,F.__webglTexture),st(ne,me),Ct(G.__webglFramebuffer,P,me,i.COLOR_ATTACHMENT0+Q,ne,0),S(me)&&y(ne)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(Q=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,ae.__webglTexture),st(Q,T),T.mipmaps.length>0)for(let te=0;te<T.mipmaps.length;te++)Ct(G.__webglFramebuffer[te],P,T,i.COLOR_ATTACHMENT0,Q,te);else Ct(G.__webglFramebuffer,P,T,i.COLOR_ATTACHMENT0,Q,0);S(T)?y(Q):T.mipmaps.length>0&&i.texParameteri(Q,i.TEXTURE_MAX_LEVEL,T.mipmaps.length-1),t.unbindTexture()}P.depthBuffer&&ei(P)}function B(P){let T=P.textures;for(let G=0,ae=T.length;G<ae;G++){let ie=T[G];if(S(ie)&&ie.mipmapsAutoUpdate===!0){let fe=R(P),be=n.get(ie).__webglTexture;t.bindTexture(fe,be),y(fe),t.unbindTexture()}}}let ii=[];function Ut(P){if(P.samples>0){if(_e(P)===!1){let T=P.textures,G=P.width,ae=P.height,ie=i.COLOR_BUFFER_BIT,fe=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(P),Q=T.length>1;if(Q)for(let me=0;me<T.length;me++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),P.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let me=0;me<T.length;me++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ie|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ie|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[me]);let F=n.get(T[me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,F,0)}i.blitFramebuffer(0,0,G,ae,0,0,G,ae,ie,i.NEAREST),l===!0&&(ii.length=0,ii.push(i.COLOR_ATTACHMENT0+me),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&ii.push(fe),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ii))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let me=0;me<T.length;me++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,be.__webglColorRenderbuffer[me]);let F=n.get(T[me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,F,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){let T=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[T])}}}function Ot(P){return Math.min(s.maxSamples,P.samples)}function _e(P){let T=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Qt(P){let T=a.render.frame;h.get(P)!==T&&(h.set(P,T),P.update())}function je(P,T){let G=P.colorSpace,ae=P.format,ie=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||G!==Pn&&G!==li&&(at.getTransfer(G)===yt?(ae!==Bn||ie!==kn)&&ke("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",G)),T}function Je(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=de,this.resetTextureUnits=Y,this.getTextureUnits=ee,this.setTextureUnits=he,this.setTexture2D=re,this.setTexture2DArray=Se,this.setTexture3D=Ie,this.setTextureCube=le,this.rebindTextures=ti,this.setupRenderTarget=ni,this.updateRenderTargetMipmap=B,this.updateMultisampleRenderTarget=Ut,this.setupDepthRenderbuffer=ei,this.setupFrameBufferTexture=Ct,this.useMultisampledRTT=_e,this.dispose=q}function OM(i,e){function t(n,s=li){let r,a=at.getTransfer(s);if(n===kn)return i.UNSIGNED_BYTE;if(n===kc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Bc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Nd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ud)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Dd)return i.BYTE;if(n===Fd)return i.SHORT;if(n===Fa)return i.UNSIGNED_SHORT;if(n===Oc)return i.INT;if(n===Mi)return i.UNSIGNED_INT;if(n===jn)return i.FLOAT;if(n===sn)return i.HALF_FLOAT;if(n===Od)return i.ALPHA;if(n===kd)return i.RGB;if(n===Bn)return i.RGBA;if(n===ss)return i.DEPTH_COMPONENT;if(n===vs)return i.DEPTH_STENCIL;if(n===zc)return i.RED;if(n===Hc)return i.RED_INTEGER;if(n===js)return i.RG;if(n===Gc)return i.RG_INTEGER;if(n===Vc)return i.RGBA_INTEGER;if(n===qo||n===Xo||n===jo||n===Ko)if(a===yt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===qo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Xo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===jo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ko)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===qo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Xo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===jo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ko)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Wc||n===qc||n===Xc||n===jc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Wc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===qc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Xc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===jc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Kc||n===Yc||n===Jc||n===$c||n===Zc||n===Yo||n===Qc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Kc||n===Yc)return a===yt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Jc)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===$c)return r.COMPRESSED_R11_EAC;if(n===Zc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Yo)return r.COMPRESSED_RG11_EAC;if(n===Qc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===eh||n===th||n===nh||n===ih||n===sh||n===rh||n===ah||n===oh||n===lh||n===ch||n===hh||n===uh||n===dh||n===fh)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===eh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===th)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===nh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ih)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===sh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===rh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ah)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===oh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===lh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ch)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===hh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===uh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===dh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===fh)return a===yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ph||n===mh||n===gh)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ph)return a===yt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===mh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===gh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===vh||n===bh||n===Jo||n===xh)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===vh)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Jo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===xh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Nr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var kM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,BM=`
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

}`,ff=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Lo(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ft({vertexShader:kM,fragmentShader:BM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Et(new Er(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},pf=class extends Si{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null,_=typeof XRWebGLBinding<"u",v=new ff,m={},x=t.getContextAttributes(),S=null,y=null,R=[],M=[],b=new Be,w=null,L=null,I=new en;I.viewport=new St;let N=new en;N.viewport=new St;let k=[I,N],V=new Cc,D=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let re=R[J];return re===void 0&&(re=new xa,R[J]=re),re.getTargetRaySpace()},this.getControllerGrip=function(J){let re=R[J];return re===void 0&&(re=new xa,R[J]=re),re.getGripSpace()},this.getHand=function(J){let re=R[J];return re===void 0&&(re=new xa,R[J]=re),re.getHandSpace()};function K(J){let re=M.indexOf(J.inputSource);if(re===-1)return;let Se=R[re];Se!==void 0&&(Se.update(J.inputSource,J.frame,c||a),Se.dispatchEvent({type:J.type,data:J.inputSource}))}function z(){s.removeEventListener("select",K),s.removeEventListener("selectstart",K),s.removeEventListener("selectend",K),s.removeEventListener("squeeze",K),s.removeEventListener("squeezestart",K),s.removeEventListener("squeezeend",K),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",se);for(let J=0;J<R.length;J++){let re=M[J];re!==null&&(M[J]=null,R[J].disconnect(re))}D=null,q=null,v.reset();for(let J in m)delete m[J];if(e.setRenderTarget(S),p=null,d=null,u=null,s=null,y=null,de.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(b.width,b.height,!1),L!==null){let J=L.camera;J.fov=L.fov,J.zoom=L.zoom,J.updateProjectionMatrix(),L=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&ke("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&ke("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",K),s.addEventListener("selectstart",K),s.addEventListener("selectend",K),s.addEventListener("squeeze",K),s.addEventListener("squeezestart",K),s.addEventListener("squeezeend",K),s.addEventListener("end",z),s.addEventListener("inputsourceschange",se),x.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(b),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Ie=null,le=null;x.depth&&(le=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=x.stencil?vs:ss,Ie=x.stencil?Nr:Mi);let Xe={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Xe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new jt(d.textureWidth,d.textureHeight,{format:Bn,type:kn,depthTexture:new ls(d.textureWidth,d.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let Se={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Se),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new jt(p.framebufferWidth,p.framebufferHeight,{format:Bn,type:kn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),de.setContext(s),de.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function se(J){for(let re=0;re<J.removed.length;re++){let Se=J.removed[re],Ie=M.indexOf(Se);Ie>=0&&(M[Ie]=null,R[Ie].disconnect(Se))}for(let re=0;re<J.added.length;re++){let Se=J.added[re],Ie=M.indexOf(Se);if(Ie===-1){for(let Xe=0;Xe<R.length;Xe++)if(Xe>=M.length){M.push(Se),Ie=Xe;break}else if(M[Xe]===null){M[Xe]=Se,Ie=Xe;break}if(Ie===-1)break}let le=R[Ie];le&&le.connect(Se)}}function X(J,re){re===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(re.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let re=J.near,Se=J.far;v.texture!==null&&(v.depthNear>0&&(re=v.depthNear),v.depthFar>0&&(Se=v.depthFar)),V.near=N.near=I.near=re,V.far=N.far=I.far=Se,(D!==V.near||q!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),D=V.near,q=V.far),V.layers.mask=J.layers.mask|6,I.layers.mask=V.layers.mask&-5,N.layers.mask=V.layers.mask&-3;let Ie=J.parent,le=V.cameras;X(V,Ie);for(let Xe=0;Xe<le.length;Xe++)X(le[Xe],Ie);V.projectionMatrix.copy(I.projectionMatrix),V.projectionMatrixInverse.copy(I.projectionMatrixInverse),L===null&&J.isPerspectiveCamera&&(L={camera:J,fov:J.fov,zoom:J.zoom}),Y(J,V,Ie)};function Y(J,re,Se){Se===null?J.matrix.copy(re.matrixWorld):(J.matrix.copy(Se.matrixWorld),J.matrix.invert(),J.matrix.multiply(re.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(re.projectionMatrix),J.projectionMatrixInverse.copy(re.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=_r*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(J){l=J,d!==null&&(d.fixedFoveation=J),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=J)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(V)},this.getCameraTexture=function(J){return m[J]};let ee=null;function he(J,re){if(h=re.getViewerPose(c||a),g=re,h!==null){let Se=h.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Ie=!1;Se.length!==V.cameras.length&&(V.cameras.length=0,Ie=!0);for(let Oe=0;Oe<Se.length;Oe++){let st=Se[Oe],lt=null;if(p!==null)lt=p.getViewport(st);else{let Yt=u.getViewSubImage(d,st);lt=Yt.viewport,Oe===0&&(e.setRenderTargetTextures(y,Yt.colorTexture,Yt.depthStencilTexture),e.setRenderTarget(y))}let rt=k[Oe];rt===void 0&&(rt=new en,rt.layers.enable(Oe),rt.viewport=new St,k[Oe]=rt),rt.matrix.fromArray(st.transform.matrix),rt.matrix.decompose(rt.position,rt.quaternion,rt.scale),rt.projectionMatrix.fromArray(st.projectionMatrix),rt.projectionMatrixInverse.copy(rt.projectionMatrix).invert(),rt.viewport.set(lt.x,lt.y,lt.width,lt.height),Oe===0&&(V.matrix.copy(rt.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ie===!0&&V.cameras.push(rt)}let le=s.enabledFeatures;if(le&&le.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let Oe=u.getDepthInformation(Se[0]);Oe&&Oe.isValid&&Oe.texture&&v.init(Oe,s.renderState)}if(le&&le.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let Oe=0;Oe<Se.length;Oe++){let st=Se[Oe].camera;if(st){let lt=m[st];lt||(lt=new Lo,m[st]=lt);let rt=u.getCameraImage(st);lt.sourceTexture=rt}}}}for(let Se=0;Se<R.length;Se++){let Ie=M[Se],le=R[Se];Ie!==null&&le!==void 0&&le.update(Ie,re,c||a)}ee&&ee(J,re),re.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:re}),g=null}let de=new i0;de.setAnimationLoop(he),this.setAnimationLoop=function(J){ee=J},this.dispose=function(){}}},zM=new qe,f0=new Ye;f0.set(-1,0,0,0,1,0,0,0,1);function HM(i,e){function t(v,m){v.matrixAutoUpdate===!0&&v.updateMatrix(),m.value.copy(v.matrix)}function n(v,m){m.color.getRGB(v.fogColor.value,Yd(i)),m.isFog?(v.fogNear.value=m.near,v.fogFar.value=m.far):m.isFogExp2&&(v.fogDensity.value=m.density)}function s(v,m,x,S,y){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(v,m):m.isMeshLambertMaterial?(r(v,m),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(v,m),u(v,m)):m.isMeshPhongMaterial?(r(v,m),h(v,m),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(v,m),d(v,m),m.isMeshPhysicalMaterial&&p(v,m,y)):m.isMeshMatcapMaterial?(r(v,m),g(v,m)):m.isMeshDepthMaterial?r(v,m):m.isMeshDistanceMaterial?(r(v,m),_(v,m)):m.isMeshNormalMaterial?r(v,m):m.isLineBasicMaterial?(a(v,m),m.isLineDashedMaterial&&o(v,m)):m.isPointsMaterial?l(v,m,x,S):m.isSpriteMaterial?c(v,m):m.isShadowMaterial?(v.color.value.copy(m.color),v.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(v,m){v.opacity.value=m.opacity,m.color&&v.diffuse.value.copy(m.color),m.emissive&&v.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.bumpMap&&(v.bumpMap.value=m.bumpMap,t(m.bumpMap,v.bumpMapTransform),v.bumpScale.value=m.bumpScale,m.side===nn&&(v.bumpScale.value*=-1)),m.normalMap&&(v.normalMap.value=m.normalMap,t(m.normalMap,v.normalMapTransform),v.normalScale.value.copy(m.normalScale),m.side===nn&&v.normalScale.value.negate()),m.displacementMap&&(v.displacementMap.value=m.displacementMap,t(m.displacementMap,v.displacementMapTransform),v.displacementScale.value=m.displacementScale,v.displacementBias.value=m.displacementBias),m.emissiveMap&&(v.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,v.emissiveMapTransform)),m.specularMap&&(v.specularMap.value=m.specularMap,t(m.specularMap,v.specularMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest);let x=e.get(m),S=x.envMap,y=x.envMapRotation;S&&(v.envMap.value=S,v.envMapRotation.value.setFromMatrix4(zM.makeRotationFromEuler(y)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(f0),v.reflectivity.value=m.reflectivity,v.ior.value=m.ior,v.refractionRatio.value=m.refractionRatio),m.lightMap&&(v.lightMap.value=m.lightMap,v.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,v.lightMapTransform)),m.aoMap&&(v.aoMap.value=m.aoMap,v.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,v.aoMapTransform))}function a(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform))}function o(v,m){v.dashSize.value=m.dashSize,v.totalSize.value=m.dashSize+m.gapSize,v.scale.value=m.scale}function l(v,m,x,S){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.size.value=m.size*x,v.scale.value=S*.5,m.map&&(v.map.value=m.map,t(m.map,v.uvTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function c(v,m){v.diffuse.value.copy(m.color),v.opacity.value=m.opacity,v.rotation.value=m.rotation,m.map&&(v.map.value=m.map,t(m.map,v.mapTransform)),m.alphaMap&&(v.alphaMap.value=m.alphaMap,t(m.alphaMap,v.alphaMapTransform)),m.alphaTest>0&&(v.alphaTest.value=m.alphaTest)}function h(v,m){v.specular.value.copy(m.specular),v.shininess.value=Math.max(m.shininess,1e-4)}function u(v,m){m.gradientMap&&(v.gradientMap.value=m.gradientMap)}function d(v,m){v.metalness.value=m.metalness,m.metalnessMap&&(v.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,v.metalnessMapTransform)),v.roughness.value=m.roughness,m.roughnessMap&&(v.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,v.roughnessMapTransform)),m.envMap&&(v.envMapIntensity.value=m.envMapIntensity)}function p(v,m,x){v.ior.value=m.ior,m.diffuseRoughness>0&&(v.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(v.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,v.diffuseRoughnessMapTransform))),m.sheen>0&&(v.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),v.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(v.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,v.sheenColorMapTransform)),m.sheenRoughnessMap&&(v.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,v.sheenRoughnessMapTransform))),m.clearcoat>0&&(v.clearcoat.value=m.clearcoat,v.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(v.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,v.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(v.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===nn&&v.clearcoatNormalScale.value.negate())),m.dispersion>0&&(v.dispersion.value=m.dispersion),m.retroreflectivity>0&&(v.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(v.iridescence.value=m.iridescence,v.iridescenceIOR.value=m.iridescenceIOR,v.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,v.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(v.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,v.iridescenceMapTransform)),m.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),m.transmission>0&&(v.transmission.value=m.transmission,v.transmissionSamplerMap.value=x.texture,v.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(v.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,v.transmissionMapTransform)),v.thickness.value=m.thickness,m.thicknessMap&&(v.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=m.attenuationDistance,v.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(v.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(v.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=m.specularIntensity,v.specularColor.value.copy(m.specularColor),m.specularColorMap&&(v.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,v.specularColorMapTransform)),m.specularIntensityMap&&(v.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,v.specularIntensityMapTransform))}function g(v,m){m.matcap&&(v.matcap.value=m.matcap)}function _(v,m){let x=e.get(m).light;v.referencePosition.value.setFromMatrixPosition(x.matrixWorld),v.nearDistance.value=x.shadow.camera.near,v.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function GM(i,e,t,n){let s={},r={};function a(x,S){let y=S.program;n.uniformBlockBinding(x,y,s[x.id])}function o(x,S){let y=s[x.id];y===void 0&&(g(x),y=l(x),s[x.id]=y,x.addEventListener("dispose",v));let R=S.program;n.updateUBOMapping(x,R);let M=e.render.frame;r[x.id]!==M&&(c(x),r[x.id]=M)}function l(x){let S=i.createBuffer(),y=x.__size,R=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,y,R),i.bindBuffer(i.UNIFORM_BUFFER,null),S}function c(x){let S=s[x.id],y=x.uniforms,R=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let M=0,b=y.length;M<b;M++){let w=y[M];if(Array.isArray(w))for(let L=0,I=w.length;L<I;L++)h(w[L],M,L,R);else h(w,M,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(x,S,y,R){if(d(x,S,y,R)===!0){let M=x.__offset,b=x.value;if(Array.isArray(b)){let w=0;for(let L=0;L<b.length;L++){let I=b[L],N=_(I,!0);u(I,x.__data,w),w+=N.storage/Float32Array.BYTES_PER_ELEMENT}}else u(b,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,M,x.__data)}}function u(x,S,y){typeof x=="number"||typeof x=="boolean"?S[y]=x:x.isMatrix3?(S[y]=x.elements[0],S[y+1]=x.elements[1],S[y+2]=x.elements[2],S[y+3]=0,S[y+4]=x.elements[3],S[y+5]=x.elements[4],S[y+6]=x.elements[5],S[y+7]=0,S[y+8]=x.elements[6],S[y+9]=x.elements[7],S[y+10]=x.elements[8],S[y+11]=0):ArrayBuffer.isView(x)?S.set(x.subarray(0,S.length-y),y):x.toArray(S,y)}function d(x,S,y,R){let M=x.value,b=S+"_"+y;if(Array.isArray(M)){R[b]===void 0&&(R[b]=[]);let w=R[b],L=!1;for(let I=0;I<M.length;I++)p(M[I],w,I)===!0&&(L=!0);return L}return p(M,R,b)}function p(x,S,y){if(S[y]===void 0)return typeof x=="number"||typeof x=="boolean"?S[y]=x:ArrayBuffer.isView(x)?S[y]=x.slice():S[y]=x.clone(),!0;{let R=S[y];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return S[y]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function g(x){let S=x.uniforms,y=0,R=16;for(let b=0,w=S.length;b<w;b++){let L=Array.isArray(S[b])?S[b]:[S[b]];for(let I=0,N=L.length;I<N;I++){let k=L[I],V=Array.isArray(k.value)?k.value:[k.value],D=Array.isArray(S[b])||Array.isArray(k.value),q=y;for(let z=0,se=V.length;z<se;z++){let X=V[z],Y=_(X,D),ee=y%R,he=ee%Y.boundary,de=ee+he;y+=he,de!==0&&R-de<Y.storage&&(y+=R-de),z===0&&(q=y),y+=Y.storage}let K=k.type==="int"?Int32Array:k.type==="uint"?Uint32Array:Float32Array;k.__data=new K((y-q)/Float32Array.BYTES_PER_ELEMENT),k.__offset=q}}let M=y%R;return M>0&&(y+=R-M),x.__size=y,x.__cache={},this}function _(x,S){let y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=16,y.storage=48):x.isMatrix4?(y.boundary=16,y.storage=64):x.isTexture?ke("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(y.boundary=16,y.storage=x.byteLength):ke("WebGLRenderer: Unsupported uniform value type.",x),S===!0&&(y.boundary=16,y.storage=Math.ceil(y.storage/16)*16),y}function v(x){let S=x.target;S.removeEventListener("dispose",v),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function m(){for(let x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:a,update:o,dispose:m}}var VM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Bi=null;function WM(){return Bi===null&&(Bi=new Gs(VM,16,16,js,sn),Bi.name="DFG_LUT",Bi.minFilter=Ht,Bi.magFilter=Ht,Bi.wrapS=ri,Bi.wrapT=ri,Bi.generateMipmaps=!1,Bi.needsUpdate=!0),Bi}var Ah=class{constructor(e={}){let{canvas:t=Cg(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:p=kn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let _=p,v=new Set([Vc,Gc,Hc]),m=new Set([kn,Mi,Fa,Nr,kc,Bc]),x=new Uint32Array(4),S=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},R=null,M=null,b=[],w=[],L=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=oi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,N=!1,k=null,V=null,D=null,q=null;this._outputColorSpace=zt;let K=0,z=0,se=null,X=-1,Y=null,ee=new St,he=new St,de=null,J=new Me(0),re=0,Se=t.width,Ie=t.height,le=1,Xe=null,Mt=null,Oe=new St(0,0,Se,Ie),st=new St(0,0,Se,Ie),lt=!1,rt=new Vs,Yt=new gc,Vt=!1,ln=!1,Ct=new qe,Nn=new C,Wt=new St,ei={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ti=!1;function ni(){return se===null?le:1}let B=n;function ii(E,U){return t.getContext(E,U)}let Ut,Ot,_e,Qt,je,Je,P,T,G,ae,ie,fe,be,Q,te,me,F,ne,$,ge,ue,pe,He;try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",We,!1),t.addEventListener("webglcontextrestored",Qe,!1),t.addEventListener("webglcontextcreationerror",Ee,!1),B===null){let U="webgl2";if(B=ii(U,E),B===null)throw ii(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}et()}catch(E){throw t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",Qe,!1),t.removeEventListener("webglcontextcreationerror",Ee,!1),Ke("WebGLRenderer: "+E.message),E}function et(){Ut=new tS(B),Ut.init(),ue=new OM(B,Ut),Ot=new W_(B,Ut,e,ue),_e=new NM(B,Ut),Ot.reversedDepthBuffer&&d&&_e.buffers.depth.setReversed(!0),V=B.createFramebuffer(),D=B.createFramebuffer(),q=B.createFramebuffer(),Qt=new sS(B),je=new _M,Je=new UM(B,Ut,_e,je,Ot,ue,Qt),P=new eS(I),T=new ax(B),pe=new G_(B,T),G=new nS(B,T,Qt,pe),ae=new aS(B,G,T,pe,Qt),ne=new rS(B,Ot,Je),te=new q_(je),ie=new yM(I,P,Ut,Ot,pe,te),fe=new HM(I,je),be=new MM,Q=new CM(Ut),F=new H_(I,P,_e,ae,g,l),me=new FM(I,ae,Ot),He=new GM(B,Qt,Ot,_e),$=new V_(B,Ut,Qt),ge=new iS(B,Ut,Qt),Qt.programs=ie.programs,I.capabilities=Ot,I.extensions=Ut,I.properties=je,I.renderLists=be,I.shadowMap=me,I.state=_e,I.info=Qt}_!==kn&&(L=new lS(_,t.width,t.height,o,s,r));let oe=new pf(I,B);this.xr=oe,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let E=Ut.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=Ut.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(E){E!==void 0&&(le=E,this.setSize(Se,Ie,!1))},this.getSize=function(E){return E.set(Se,Ie)},this.setSize=function(E,U,j=!0){if(oe.isPresenting){ke("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=E,Ie=U,t.width=Math.floor(E*le),t.height=Math.floor(U*le),j===!0&&(t.style.width=E+"px",t.style.height=U+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(Se*le,Ie*le).floor()},this.setDrawingBufferSize=function(E,U,j){Se=E,Ie=U,le=j,t.width=Math.floor(E*j),t.height=Math.floor(U*j),this.setViewport(0,0,E,U)},this.setEffects=function(E){if(_===kn){Ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let U=0;U<E.length;U++)if(E[U].isOutputPass===!0){ke("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(ee)},this.getViewport=function(E){return E.copy(Oe)},this.setViewport=function(E,U,j,H){E.isVector4?Oe.set(E.x,E.y,E.z,E.w):Oe.set(E,U,j,H),_e.viewport(ee.copy(Oe).multiplyScalar(ni()).round())},this.getScissor=function(E){return E.copy(st)},this.setScissor=function(E,U,j,H){E.isVector4?st.set(E.x,E.y,E.z,E.w):st.set(E,U,j,H),_e.scissor(he.copy(st).multiplyScalar(ni()).round())},this.getScissorTest=function(){return lt},this.setScissorTest=function(E){_e.setScissorTest(lt=E)},this.setOpaqueSort=function(E){Xe=E},this.setTransparentSort=function(E){Mt=E},this.getClearColor=function(E){return E.copy(F.getClearColor())},this.setClearColor=function(){F.setClearColor(...arguments)},this.getClearAlpha=function(){return F.getClearAlpha()},this.setClearAlpha=function(){F.setClearAlpha(...arguments)},this.clear=function(E=!0,U=!0,j=!0){let H=0;if(E){let W=!1;if(se!==null){let xe=se.texture.format;W=v.has(xe)}if(W){let xe=se.texture.type,Le=m.has(xe),ve=F.getClearColor(),Re=F.getClearAlpha(),Ue=ve.r,$e=ve.g,dt=ve.b;Le?(x[0]=Ue,x[1]=$e,x[2]=dt,x[3]=Re,B.clearBufferuiv(B.COLOR,0,x)):(S[0]=Ue,S[1]=$e,S[2]=dt,S[3]=Re,B.clearBufferiv(B.COLOR,0,S))}else H|=B.COLOR_BUFFER_BIT}U&&(H|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(H|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H!==0&&B.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),k=E},this.dispose=function(){t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",Qe,!1),t.removeEventListener("webglcontextcreationerror",Ee,!1),F.dispose(),be.dispose(),Q.dispose(),Je.dispose(),je.dispose(),P.dispose(),ae.dispose(),G.dispose(),pe.dispose(),He.dispose(),ie.dispose(),oe.dispose(),oe.removeEventListener("sessionstart",Qp),oe.removeEventListener("sessionend",em),cr.stop()};function We(E){E.preventDefault(),So("WebGLRenderer: Context Lost."),N=!0}function Qe(){So("WebGLRenderer: Context Restored."),N=!1;let E=Qt.autoReset,U=me.enabled,j=me.autoUpdate,H=me.needsUpdate,W=me.type;et(),Qt.autoReset=E,me.enabled=U,me.autoUpdate=j,me.needsUpdate=H,me.type=W}function Ee(E){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function _t(E){let U=E.target;U.removeEventListener("dispose",_t),cn(U)}function cn(E){Ds(E),je.remove(E)}function Ds(E){let U=je.get(E).programs;U!==void 0&&(U.forEach(function(j){ie.releaseProgram(j)}),E.isShaderMaterial&&ie.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,j,H,W,xe){U===null&&(U=ei);let Le=W.isMesh&&W.matrixWorld.determinantAffine()<0,ve=Zv(E,U,j,H,W);_e.setMaterial(H,Le);let Re=j.index,Ue=1;if(H.wireframe===!0){if(Re=G.getWireframeAttribute(j),Re===void 0)return;Ue=2}let $e=j.drawRange,dt=j.attributes.position,De=$e.start*Ue,ft=($e.start+$e.count)*Ue;xe!==null&&(De=Math.max(De,xe.start*Ue),ft=Math.min(ft,(xe.start+xe.count)*Ue)),Re!==null?(De=Math.max(De,0),ft=Math.min(ft,Re.count)):dt!=null&&(De=Math.max(De,0),ft=Math.min(ft,dt.count));let Jt=ft-De;if(Jt<0||Jt===1/0)return;pe.setup(W,H,ve,j,Re);let Dt,Pt=$;if(Re!==null&&(Dt=T.get(Re),Pt=ge,Pt.setIndex(Dt)),W.isMesh)H.wireframe===!0?(_e.setLineWidth(H.wireframeLinewidth*ni()),Pt.setMode(B.LINES)):Pt.setMode(B.TRIANGLES);else if(W.isLine){let mn=H.linewidth;mn===void 0&&(mn=1),_e.setLineWidth(mn*ni()),W.isLineSegments?Pt.setMode(B.LINES):W.isLineLoop?Pt.setMode(B.LINE_LOOP):Pt.setMode(B.LINE_STRIP)}else W.isPoints?Pt.setMode(B.POINTS):W.isSprite&&Pt.setMode(B.TRIANGLES);if(W.isBatchedMesh)if(Ut.get("WEBGL_multi_draw"))Pt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let mn=W._multiDrawStarts,Fe=W._multiDrawCounts,Rn=W._multiDrawCount,vt=Re?T.get(Re).bytesPerElement:1,hr=je.get(H).currentProgram.getUniforms();for(let gn=0;gn<Rn;gn++)hr.setValue(B,"_gl_DrawID",gn),Pt.render(mn[gn]/vt,Fe[gn])}else if(W.isInstancedMesh)Pt.renderInstances(De,Jt,W.count);else if(j.isInstancedBufferGeometry){let mn=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Fe=Math.min(j.instanceCount,mn);Pt.renderInstances(De,Jt,Fe)}else Pt.render(De,Jt)};function Zp(E,U,j,H){k!==null&&E.isNodeMaterial&&k.setObject(H,E),Vt===!0&&te.setState(E,j,!1),E.transparent===!0&&E.side===yn&&E.forceSinglePass===!1?(E.side=nn,E.needsUpdate=!0,oo(E,U,H),E.side=Oi,E.needsUpdate=!0,oo(E,U,H),E.side=yn):oo(E,U,H)}this.compile=function(E,U,j=null){j===null&&(j=E),k!==null&&k.renderStart(E,U,j),M=Q.get(j),M.init(U),w.push(M),j.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(M.pushLight(W),W.castShadow&&M.pushShadow(W))}),E!==j&&E.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(M.pushLight(W),W.castShadow&&M.pushShadow(W))}),M.setupLights(),k!==null&&k.updateLights(M.state.lightsArray),ln=this.localClippingEnabled,Vt=te.init(this.clippingPlanes,ln),Vt===!0&&te.setGlobalState(this.clippingPlanes,U),k!==null&&me.render(M.state.shadowsArray,j,U);let H=new Set;return E.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let xe=W.material;if(xe)if(Array.isArray(xe))for(let Le=0;Le<xe.length;Le++){let ve=xe[Le];Zp(ve,j,U,W),H.add(ve)}else Zp(xe,j,U,W),H.add(xe)}),M=w.pop(),k!==null&&k.renderEnd(),H},this.compileAsync=function(E,U,j=null){let H=this.compile(E,U,j);return new Promise(W=>{function xe(){if(H.forEach(function(Le){let Re=je.get(Le).currentProgram;(Re===void 0||Re.isReady())&&H.delete(Le)}),H.size===0){W(E);return}setTimeout(xe,10)}Ut.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let ku=null;function Jv(E){ku&&ku(E)}function Qp(){cr.stop()}function em(){cr.start()}let cr=new i0;cr.setAnimationLoop(Jv),typeof self<"u"&&cr.setContext(self),this.setAnimationLoop=function(E){ku=E,oe.setAnimationLoop(E),E===null?cr.stop():cr.start()},oe.addEventListener("sessionstart",Qp),oe.addEventListener("sessionend",em),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;k!==null&&k.renderStart(E,U);let j=oe.enabled===!0&&oe.isPresenting===!0,H=L!==null&&(se===null||j)&&L.begin(I,se);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),oe.enabled===!0&&oe.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(oe.cameraAutoUpdate===!0&&oe.updateCamera(U),U=oe.getCamera()),E.isScene===!0&&E.onBeforeRender(I,E,U,se),M=Q.get(E,w.length),M.init(U),M.state.textureUnits=Je.getTextureUnits(),w.push(M),Ct.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera?Yt.setFromArrayCamera(U):rt.setFromProjectionMatrix(Ct,ai,U.reversedDepth),ln=this.localClippingEnabled,Vt=te.init(this.clippingPlanes,ln),R=be.get(E,b.length),R.init(),b.push(R),this.info.render.frame++,oe.enabled===!0&&oe.isPresenting===!0){let Le=I.xr.getDepthSensingMesh();Le!==null&&Bu(Le,U,-1/0,I.sortObjects)}Bu(E,U,0,I.sortObjects),R.finish(),k!==null&&k.updateLights(M.state.lightsArray),I.sortObjects===!0&&R.sort(Xe,Mt),ti=oe.enabled===!1||oe.isPresenting===!1||oe.hasDepthSensing()===!1,ti&&F.addToRenderList(R,E),this.info.autoReset===!0&&this.info.reset(),Vt===!0&&te.beginShadows();let W=M.state.shadowsArray;if(me.render(W,E,U),Vt===!0&&te.endShadows(),(H&&L.hasRenderPass())===!1){let Le=R.opaque,ve=R.transmissive;if(M.setupLights(),U.isArrayCamera){let Re=U.cameras;if(ve.length>0)for(let Ue=0,$e=Re.length;Ue<$e;Ue++){let dt=Re[Ue];nm(Le,ve,E,dt)}ti&&F.render(E);for(let Ue=0,$e=Re.length;Ue<$e;Ue++){let dt=Re[Ue];tm(R,E,dt,dt.viewport)}}else ve.length>0&&nm(Le,ve,E,U),ti&&F.render(E),tm(R,E,U)}se!==null&&z===0&&(Je.updateMultisampleRenderTarget(se),Je.updateRenderTargetMipmap(se)),H&&L.end(I),E.isScene===!0&&E.onAfterRender(I,E,U),pe.resetDefaultState(),X=-1,Y=null,w.pop(),w.length>0?(M=w[w.length-1],Je.setTextureUnits(M.state.textureUnits),Vt===!0&&te.setGlobalState(I.clippingPlanes,M.state.camera)):M=null,b.pop(),b.length>0?R=b[b.length-1]:R=null,k!==null&&k.renderEnd()};function Bu(E,U,j,H){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)j=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)M.pushLight(E),E.castShadow&&M.pushShadow(E);else if(E.isSprite){let Le=U.isArrayCamera?Yt:rt;if(!E.frustumCulled||E.intersectsFrustum(Le)){H&&Wt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Ct);let ve=ae.update(E),Re=E.material;Re.visible&&R.push(E,ve,Re,j,Wt.z,null,U)}}else if(E.isMesh||E.isLine||E.isPoints){let Le=U.isArrayCamera?Yt:rt;if(!E.frustumCulled||E.intersectsFrustum(Le)){let ve=ae.update(E),Re=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Wt.copy(E.boundingSphere.center)):(ve.boundingSphere===null&&ve.computeBoundingSphere(),Wt.copy(ve.boundingSphere.center)),Wt.applyMatrix4(E.matrixWorld).applyMatrix4(Ct)),Array.isArray(Re)){let Ue=ve.groups;for(let $e=0,dt=Ue.length;$e<dt;$e++){let De=Ue[$e],ft=Re[De.materialIndex];ft&&ft.visible&&R.push(E,ve,ft,j,Wt.z,De,U)}}else Re.visible&&R.push(E,ve,Re,j,Wt.z,null,U)}}}let xe=E.children;for(let Le=0,ve=xe.length;Le<ve;Le++)Bu(xe[Le],U,j,H)}function tm(E,U,j,H){let{opaque:W,transmissive:xe,transparent:Le}=E;M.setupLightsView(j),Vt===!0&&te.setGlobalState(I.clippingPlanes,j),H&&_e.viewport(ee.copy(H)),W.length>0&&Il(W,U,j),xe.length>0&&Il(xe,U,j),Le.length>0&&Il(Le,U,j),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function nm(E,U,j,H){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[H.id]===void 0){let De=Ut.has("EXT_color_buffer_half_float")||Ut.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[H.id]=new jt(1,1,{generateMipmaps:!0,type:De?sn:kn,minFilter:_n,samples:Math.max(4,Ot.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:at.workingColorSpace})}let xe=M.state.transmissionRenderTarget[H.id],Le=H.viewport||ee;xe.setSize(Le.z*I.transmissionResolutionScale,Le.w*I.transmissionResolutionScale);let ve=I.getRenderTarget(),Re=I.getActiveCubeFace(),Ue=I.getActiveMipmapLevel();I.setRenderTarget(xe),I.getClearColor(J),re=I.getClearAlpha(),re<1&&I.setClearColor(16777215,.5),I.clear(),ti&&F.render(j);let $e=I.toneMapping;I.toneMapping=oi;let dt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),M.setupLightsView(H),Vt===!0&&te.setGlobalState(I.clippingPlanes,H),Il(E,j,H),Je.updateMultisampleRenderTarget(xe),Je.updateRenderTargetMipmap(xe),Ut.has("WEBGL_multisampled_render_to_texture")===!1){let De=!1;for(let ft=0,Jt=U.length;ft<Jt;ft++){let Dt=U[ft],{object:Pt,geometry:mn,material:Fe,group:Rn}=Dt;if(Fe.side===yn&&Pt.layers.test(H.layers)){let vt=Fe.side;Fe.side=nn,Fe.needsUpdate=!0,im(Pt,j,H,mn,Fe,Rn),Fe.side=vt,Fe.needsUpdate=!0,De=!0}}De===!0&&(Je.updateMultisampleRenderTarget(xe),Je.updateRenderTargetMipmap(xe))}I.setRenderTarget(ve,Re,Ue),I.setClearColor(J,re),dt!==void 0&&(H.viewport=dt),I.toneMapping=$e}function Il(E,U,j){let H=U.isScene===!0?U.overrideMaterial:null;for(let W=0,xe=E.length;W<xe;W++){let Le=E[W],{object:ve,geometry:Re,group:Ue}=Le,$e=Le.material;$e.allowOverride===!0&&H!==null&&($e=H),ve.layers.test(j.layers)&&im(ve,U,j,Re,$e,Ue)}}function im(E,U,j,H,W,xe){k!==null&&W.isNodeMaterial&&k.setObject(E,W),E.onBeforeRender(I,U,j,H,W,xe),E.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),W.onBeforeRender(I,U,j,H,E,xe),W.transparent===!0&&W.side===yn&&W.forceSinglePass===!1?(W.side=nn,W.needsUpdate=!0,I.renderBufferDirect(j,U,H,W,E,xe),W.side=Oi,W.needsUpdate=!0,I.renderBufferDirect(j,U,H,W,E,xe),W.side=yn):I.renderBufferDirect(j,U,H,W,E,xe),E.onAfterRender(I,U,j,H,W,xe)}function sm(E){let U=0;for(let j of E)j.texture!==null&&U++;return U}function oo(E,U,j){U.isScene!==!0&&(U=ei);let H=je.get(E),W=M.state.lights,xe=M.state.shadowsArray,Le=W.state.version,ve=ie.getParameters(E,W.state,xe,U,j,M.state.lightProbeGridArray),Re=ie.getProgramCacheKey(ve),Ue=H.programs;H.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?U.environment:null,H.fog=U.fog;let $e=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;H.envMap=P.get(E.envMap||H.environment,$e),H.envMapRotation=H.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Ue===void 0&&(E.addEventListener("dispose",_t),Ue=new Map,H.programs=Ue,H.programVariants=new Map);let dt=Ue.get(Re);if(dt!==void 0){if(H.currentProgram===dt&&H.lightsStateVersion===Le)return am(E,ve),dt}else ve.uniforms=ie.getUniforms(E),k!==null&&E.isNodeMaterial&&k.build(E,j,ve),E.onBeforeCompile(ve,I),dt=ie.acquireProgram(ve,Re),Ue.set(Re,dt),H.uniforms=ve.uniforms;let De=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(De.clippingPlanes=te.uniform),am(E,ve),H.needsLights=eb(E),H.lightsStateVersion=Le,H.needsLights&&(De.ambientLightColor.value=W.state.ambient,De.lightProbe.value=W.state.probe,De.sunLights.value=W.state.sun,De.sunLightShadows.value=W.state.sunShadow,De.directionalLights.value=W.state.directional,De.directionalLightShadows.value=W.state.directionalShadow,De.spotLights.value=W.state.spot,De.spotLightShadows.value=W.state.spotShadow,De.rectAreaLights.value=W.state.rectArea,De.ltc_1.value=W.state.rectAreaLTC1,De.ltc_2.value=W.state.rectAreaLTC2,De.pointLights.value=W.state.point,De.pointLightShadows.value=W.state.pointShadow,De.hemisphereLights.value=W.state.hemi,De.sunShadowMatrix.value=W.state.sunShadowMatrix,De.sunShadowCascade.value=W.state.sunShadowCascade,De.directionalShadowMatrix.value=W.state.directionalShadowMatrix,De.spotLightMatrix.value=W.state.spotLightMatrix,De.spotLightMap.value=W.state.spotLightMap,De.pointShadowMatrix.value=W.state.pointShadowMatrix),H.numLightProbeGrids=sm(M.state.lightProbeGridArray),H.currentProgram=dt,H.uniformsList=null,dt}function $v(E,U,j,H,W){let xe=je.get(E),Le=xe.currentProgram.id+","+H+","+W,ve=xe.programVariants.get(Le);return ve===void 0?(ve=oo(E,U,j),xe.programVariants.set(Le,ve)):(xe.currentProgram=ve,xe.uniformsList=null,xe.outputColorSpace=H,xe.toneMapping=W),ve}function rm(E){if(E.uniformsList===null){let U=E.currentProgram.getUniforms();E.uniformsList=Oa.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function am(E,U){let j=je.get(E);j.outputColorSpace=U.outputColorSpace,j.batching=U.batching,j.batchingColor=U.batchingColor,j.instancing=U.instancing,j.instancingColor=U.instancingColor,j.instancingMorph=U.instancingMorph,j.skinning=U.skinning,j.morphTargets=U.morphTargets,j.morphNormals=U.morphNormals,j.morphColors=U.morphColors,j.morphTargetsCount=U.morphTargetsCount,j.numClippingPlanes=U.numClippingPlanes,j.numIntersection=U.numClipIntersection,j.vertexAlphas=U.vertexAlphas,j.vertexTangents=U.vertexTangents,j.toneMapping=U.toneMapping}function Zv(E,U,j,H,W){U.isScene!==!0&&(U=ei),Je.resetTextureUnits();let xe=U.fog,Le=H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial?U.environment:null,ve=se===null?I.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:at.workingColorSpace,Re=H.isMeshStandardMaterial||H.isMeshLambertMaterial&&!H.envMap||H.isMeshPhongMaterial&&!H.envMap,Ue=P.get(H.envMap||Le,Re),$e=H.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,dt=!!j.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),De=!!j.morphAttributes.position,ft=!!j.morphAttributes.normal,Jt=!!j.morphAttributes.color,Dt=oi;H.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(Dt=I.toneMapping);let Pt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,mn=Pt!==void 0?Pt.length:0,Fe=je.get(H),Rn=M.state.lights;if(Vt===!0&&(ln===!0||E!==Y)){let Bt=E===Y&&H.id===X;te.setState(H,E,Bt)}let vt=!1,hr=!1;H.version===Fe.__version?Fe.needsLights&&Fe.lightsStateVersion!==Rn.state.version||W.isBatchedMesh&&Fe.batching===!1||!W.isBatchedMesh&&Fe.batching===!0||W.isBatchedMesh&&Fe.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Fe.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Fe.instancing===!1||!W.isInstancedMesh&&Fe.instancing===!0||W.isSkinnedMesh&&Fe.skinning===!1||!W.isSkinnedMesh&&Fe.skinning===!0||W.isInstancedMesh&&Fe.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Fe.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Fe.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Fe.instancingMorph===!1&&W.morphTexture!==null||Fe.envMap!==Ue||H.fog===!0&&Fe.fog!==xe||Fe.numClippingPlanes!==void 0&&(Fe.numClippingPlanes!==te.numPlanes||Fe.numIntersection!==te.numIntersection)||Fe.vertexAlphas!==$e||Fe.vertexTangents!==dt||Fe.morphTargets!==De||Fe.morphNormals!==ft||Fe.morphColors!==Jt||Fe.morphTargetsCount!==mn||Fe.numLightProbeGrids!==sm(M.state.lightProbeGridArray)?vt=!0:(Fe.outputColorSpace!==ve||Fe.toneMapping!==Dt)&&(hr=!0):(vt=!0,Fe.__version=H.version);let gn=Fe.currentProgram;(vt===!0||hr===!0)&&(gn=hr===!0?$v(H,U,W,ve,Dt):oo(H,U,W),k&&H.isNodeMaterial&&k.onUpdateProgram(H,gn,Fe));let Ll=!1,Fs=!1,ur=!1,mt=gn.getUniforms(),fn=Fe.uniforms;if(_e.useProgram(gn.program)&&(Ll=!0,Fs=!0,ur=!0),H.id!==X&&(X=H.id,Fs=!0),Ll||Y!==E){_e.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),mt.setValue(B,"projectionMatrix",E.projectionMatrix),mt.setValue(B,"viewMatrix",E.matrixWorldInverse);let hn=mt.map.cameraPosition;hn!==void 0&&hn.setValue(B,Nn.setFromMatrixPosition(E.matrixWorld)),Ot.logarithmicDepthBuffer&&mt.setValue(B,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&mt.setValue(B,"isOrthographic",E.isOrthographicCamera===!0),Y!==E&&(Y=E,Fs=!0,ur=!0)}if(Fe.needsLights&&(Rn.state.sunShadowMap.length>0&&mt.setValue(B,"sunShadowMap",Rn.state.sunShadowMap,Je),Rn.state.directionalShadowMap.length>0&&mt.setValue(B,"directionalShadowMap",Rn.state.directionalShadowMap,Je),Rn.state.spotShadowMap.length>0&&mt.setValue(B,"spotShadowMap",Rn.state.spotShadowMap,Je),Rn.state.pointShadowMap.length>0&&mt.setValue(B,"pointShadowMap",Rn.state.pointShadowMap,Je)),W.isSkinnedMesh){mt.setOptional(B,W,"bindMatrix"),mt.setOptional(B,W,"bindMatrixInverse");let Bt=W.skeleton;Bt&&(Bt.boneTexture===null&&Bt.computeBoneTexture(),mt.setValue(B,"boneTexture",Bt.boneTexture,Je))}W.isBatchedMesh&&(mt.setOptional(B,W,"batchingTexture"),mt.setValue(B,"batchingTexture",W._matricesTexture,Je),mt.setOptional(B,W,"batchingIdTexture"),mt.setValue(B,"batchingIdTexture",W._indirectTexture,Je),mt.setOptional(B,W,"batchingColorTexture"),W._colorsTexture!==null&&mt.setValue(B,"batchingColorTexture",W._colorsTexture,Je));let vi=j.morphAttributes;if((vi.position!==void 0||vi.normal!==void 0||vi.color!==void 0)&&ne.update(W,j,gn),(Fs||Fe.receiveShadow!==W.receiveShadow)&&(Fe.receiveShadow=W.receiveShadow,mt.setValue(B,"receiveShadow",W.receiveShadow)),(H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial)&&H.envMap===null&&U.environment!==null&&(fn.envMapIntensity.value=U.environmentIntensity),fn.dfgLUT!==void 0&&(fn.dfgLUT.value=WM()),Fs){if(mt.setValue(B,"toneMappingExposure",I.toneMappingExposure),Fe.needsLights&&Qv(fn,ur),xe&&H.fog===!0&&fe.refreshFogUniforms(fn,xe),fe.refreshMaterialUniforms(fn,H,le,Ie,M.state.transmissionRenderTarget[E.id]),Fe.needsLights&&Fe.numLightProbeGrids>0){let Bt=y,hn=0;for(let Ji of M.state.lightProbeGridArray)Ji.texture!==null&&(Bt.textures[hn]=Ji.texture,Bt.min[hn]=Ji.boundingBox.min,Bt.max[hn]=Ji.boundingBox.max,Bt.resolution[hn]=Ji.resolution,hn++);for(let Ji in Bt)Bt[Ji].length=hn;fn.probesSH.value=Bt.textures,fn.probesMin.value=Bt.min,fn.probesMax.value=Bt.max,fn.probesResolution.value=Bt.resolution}Oa.upload(B,rm(Fe),fn,Je)}if(H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Oa.upload(B,rm(Fe),fn,Je),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&mt.setValue(B,"center",W.center),mt.setValue(B,"modelViewMatrix",W.modelViewMatrix),mt.setValue(B,"normalMatrix",W.normalMatrix),mt.setValue(B,"modelMatrix",W.matrixWorld),H.uniformsGroups!==void 0){let Bt=H.uniformsGroups;for(let hn=0,Ji=Bt.length;hn<Ji;hn++){let lm=Bt[hn];He.update(lm,gn),He.bind(lm,gn)}}return gn}function Qv(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.sunLights.needsUpdate=U,E.sunLightShadows.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function eb(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return se},this.setRenderTargetTextures=function(E,U,j){let H=je.get(E);H.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),je.get(E.texture).__webglTexture=U,je.get(E.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:j,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,U){let j=je.get(E);j.__webglFramebuffer=U,j.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,j=0){se=E,K=U,z=j;let H=null,W=!1,xe=!1;if(E){let ve=je.get(E);if(ve.__useDefaultFramebuffer!==void 0){_e.bindFramebuffer(B.FRAMEBUFFER,ve.__webglFramebuffer),ee.copy(E.viewport),he.copy(E.scissor),de=E.scissorTest,_e.viewport(ee),_e.scissor(he),_e.setScissorTest(de),X=-1;return}else if(ve.__webglFramebuffer===void 0)Je.setupRenderTarget(E);else if(ve.__hasExternalTextures)Je.rebindTextures(E,je.get(E.texture).__webglTexture,je.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let $e=E.depthTexture;if(ve.__boundDepthTexture!==$e){if($e!==null&&je.has($e)&&(E.width!==$e.image.width||E.height!==$e.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Je.setupDepthRenderbuffer(E)}}let Re=E.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(xe=!0);let Ue=je.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ue[U])?H=Ue[U][j]:H=Ue[U],W=!0):E.samples>0&&Je.useMultisampledRTT(E)===!1?H=je.get(E).__webglMultisampledFramebuffer:Array.isArray(Ue)?H=Ue[j]:H=Ue,ee.copy(E.viewport),he.copy(E.scissor),de=E.scissorTest}else ee.copy(Oe).multiplyScalar(le).floor(),he.copy(st).multiplyScalar(le).floor(),de=lt;if(j!==0&&(H=V),_e.bindFramebuffer(B.FRAMEBUFFER,H)&&_e.drawBuffers(E,H),_e.viewport(ee),_e.scissor(he),_e.setScissorTest(de),W){let ve=je.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+U,ve.__webglTexture,j)}else if(xe){let ve=U;for(let Re=0;Re<E.textures.length;Re++){let Ue=je.get(E.textures[Re]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Re,Ue.__webglTexture,j,ve)}}else if(E!==null&&j!==0){let ve=je.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ve.__webglTexture,j)}X=-1};function om(E){let U=je.get(E);return(U.__readFormat!==E.format||U.__readType!==E.type)&&(U.__readFormat=E.format,U.__readType=E.type,U.__formatReadable=Ot.textureFormatReadable(E.format),U.__typeReadable=Ot.textureTypeReadable(E.type)),U}this.readRenderTargetPixels=function(E,U,j,H,W,xe,Le,ve=0){if(!(E&&E.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Re=je.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Le!==void 0&&(Re=Re[Le],Array.isArray(Re)&&(Re=Re[0])),Re){_e.bindFramebuffer(B.FRAMEBUFFER,Re);try{let Ue=E.textures[ve],$e=Ue.format,dt=Ue.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+ve);let De=om(Ue);if(De.__formatReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(De.__typeReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-H&&j>=0&&j<=E.height-W&&B.readPixels(U,j,H,W,ue.convert($e),ue.convert(dt),xe)}finally{let Ue=se!==null?je.get(se).__webglFramebuffer:null;_e.bindFramebuffer(B.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(E,U,j,H,W,xe,Le,ve=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Re=je.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Le!==void 0&&(Re=Re[Le],Array.isArray(Re)&&(Re=Re[0])),Re)if(U>=0&&U<=E.width-H&&j>=0&&j<=E.height-W){_e.bindFramebuffer(B.FRAMEBUFFER,Re);let Ue=E.textures[ve],$e=Ue.format,dt=Ue.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+ve);let De=om(Ue);if(De.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(De.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ft=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,ft),B.bufferData(B.PIXEL_PACK_BUFFER,xe.byteLength,B.STREAM_READ),B.readPixels(U,j,H,W,ue.convert($e),ue.convert(dt),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let Jt=se!==null?je.get(se).__webglFramebuffer:null;_e.bindFramebuffer(B.FRAMEBUFFER,Jt);let Dt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Ig(B,Dt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,ft),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,xe),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(ft),B.deleteSync(Dt),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,U=null,j=0){let H=Math.pow(2,-j),W=Math.floor(E.image.width*H),xe=Math.floor(E.image.height*H),Le=U!==null?U.x:0,ve=U!==null?U.y:0;Je.setTexture2D(E,0),B.copyTexSubImage2D(B.TEXTURE_2D,j,0,0,Le,ve,W,xe),_e.unbindTexture()},this.copyTextureToTexture=function(E,U,j=null,H=null,W=0,xe=0){let Le,ve,Re,Ue,$e,dt,De,ft,Jt,Dt=E.isCompressedTexture?E.mipmaps[xe]:E.image;if(j!==null)Le=j.max.x-j.min.x,ve=j.max.y-j.min.y,Re=j.isBox3?j.max.z-j.min.z:1,Ue=j.min.x,$e=j.min.y,dt=j.isBox3?j.min.z:0;else{let mt=Math.pow(2,-W);Le=Math.floor(Dt.width*mt),ve=Math.floor(Dt.height*mt),E.isDataArrayTexture?Re=Dt.depth:E.isData3DTexture?Re=Math.floor(Dt.depth*mt):Re=1,Ue=0,$e=0,dt=0}H!==null?(De=H.x,ft=H.y,Jt=H.z):(De=0,ft=0,Jt=0);let Pt=ue.convert(U.format),mn=ue.convert(U.type),Fe;U.isData3DTexture?(Je.setTexture3D(U,0),Fe=B.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Je.setTexture2DArray(U,0),Fe=B.TEXTURE_2D_ARRAY):(Je.setTexture2D(U,0),Fe=B.TEXTURE_2D),_e.activeTexture(B.TEXTURE0),_e.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,U.flipY),_e.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),_e.pixelStorei(B.UNPACK_ALIGNMENT,U.unpackAlignment);let Rn=_e.getParameter(B.UNPACK_ROW_LENGTH),vt=_e.getParameter(B.UNPACK_IMAGE_HEIGHT),hr=_e.getParameter(B.UNPACK_SKIP_PIXELS),gn=_e.getParameter(B.UNPACK_SKIP_ROWS),Ll=_e.getParameter(B.UNPACK_SKIP_IMAGES);_e.pixelStorei(B.UNPACK_ROW_LENGTH,Dt.width),_e.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Dt.height),_e.pixelStorei(B.UNPACK_SKIP_PIXELS,Ue),_e.pixelStorei(B.UNPACK_SKIP_ROWS,$e),_e.pixelStorei(B.UNPACK_SKIP_IMAGES,dt);let Fs=E.isDataArrayTexture||E.isData3DTexture,ur=U.isDataArrayTexture||U.isData3DTexture;if(E.isDepthTexture){let mt=je.get(E),fn=je.get(U),vi=je.get(mt.__renderTarget),Bt=je.get(fn.__renderTarget);_e.bindFramebuffer(B.READ_FRAMEBUFFER,vi.__webglFramebuffer),_e.bindFramebuffer(B.DRAW_FRAMEBUFFER,Bt.__webglFramebuffer);for(let hn=0;hn<Re;hn++)Fs&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,je.get(E).__webglTexture,W,dt+hn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,je.get(U).__webglTexture,xe,Jt+hn)),B.blitFramebuffer(Ue,$e,Ue+Le,$e+ve,De,ft,De+Le,ft+ve,B.DEPTH_BUFFER_BIT,B.NEAREST);_e.bindFramebuffer(B.READ_FRAMEBUFFER,null),_e.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(W!==0||E.isRenderTargetTexture||je.has(E)){let mt=je.get(E),fn=je.get(U);_e.bindFramebuffer(B.READ_FRAMEBUFFER,D),_e.bindFramebuffer(B.DRAW_FRAMEBUFFER,q);for(let vi=0;vi<Re;vi++)Fs?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,mt.__webglTexture,W,dt+vi):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,mt.__webglTexture,W),ur?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,fn.__webglTexture,xe,Jt+vi):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,fn.__webglTexture,xe),W!==0?B.blitFramebuffer(Ue,$e,Ue+Le,$e+ve,De,ft,De+Le,ft+ve,B.COLOR_BUFFER_BIT,B.NEAREST):ur?B.copyTexSubImage3D(Fe,xe,De,ft,Jt+vi,Ue,$e,Le,ve):B.copyTexSubImage2D(Fe,xe,De,ft,Ue,$e,Le,ve);_e.bindFramebuffer(B.READ_FRAMEBUFFER,null),_e.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else ur?E.isDataTexture||E.isData3DTexture?B.texSubImage3D(Fe,xe,De,ft,Jt,Le,ve,Re,Pt,mn,Dt.data):U.isCompressedArrayTexture?B.compressedTexSubImage3D(Fe,xe,De,ft,Jt,Le,ve,Re,Pt,Dt.data):B.texSubImage3D(Fe,xe,De,ft,Jt,Le,ve,Re,Pt,mn,Dt):E.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,xe,De,ft,Le,ve,Pt,mn,Dt.data):E.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,xe,De,ft,Dt.width,Dt.height,Pt,Dt.data):B.texSubImage2D(B.TEXTURE_2D,xe,De,ft,Le,ve,Pt,mn,Dt);_e.pixelStorei(B.UNPACK_ROW_LENGTH,Rn),_e.pixelStorei(B.UNPACK_IMAGE_HEIGHT,vt),_e.pixelStorei(B.UNPACK_SKIP_PIXELS,hr),_e.pixelStorei(B.UNPACK_SKIP_ROWS,gn),_e.pixelStorei(B.UNPACK_SKIP_IMAGES,Ll),xe===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0&&B.generateMipmap(Fe),_e.unbindTexture()},this.initRenderTarget=function(E){je.get(E).__webglFramebuffer===void 0&&Je.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?Je.setTextureCube(E,0):E.isData3DTexture?Je.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?Je.setTexture2DArray(E,0):Je.setTexture2D(E,0),_e.unbindTexture()},this.resetState=function(){K=0,z=0,se=null,_e.reset(),pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ai}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=at._getDrawingBufferColorSpace(e),t.unpackColorSpace=at._getUnpackColorSpace()}};var za={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var Kn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},qM=new ps(-1,1,1,-1,0,1),mf=class extends Lt{constructor(){super(),this.setAttribute("position",new It([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new It([0,2,0,0,2,0],2))}},XM=new mf,Ks=class{constructor(e){this._mesh=new Et(XM,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,qM)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Ph=class extends Kn{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Ft?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Or.clone(e.uniforms),this.material=new Ft({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Ks(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var nl=class extends Kn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Ih=class extends Kn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Lh=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new Be);this._width=n.width,this._height=n.height,t=new jt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:sn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ph(za),this.copyPass.material.blending=gs,this.timer=new Ho}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}nl!==void 0&&(a instanceof nl?n=!0:a instanceof Ih&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new Be);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Dh=class extends Kn{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Me}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var p0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Me(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Ha=class i extends Kn{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new Be(e.x,e.y):new Be(256,256),this.clearColor=new Me(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new jt(r,a,{type:sn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new jt(r,a,{type:sn,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new jt(r,a,{type:sn,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=p0;this.highPassUniforms=Or.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ft({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new Be(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Or.clone(za.uniforms),this.blendMaterial=new Ft({uniforms:this.copyUniforms,vertexShader:za.vertexShader,fragmentShader:za.fragmentShader,premultipliedAlpha:!0,blending:Wo,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Me,this._oldClearAlpha=1,this._basic=new dn,this._fsQuad=new Ks(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Be(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(n*n))/n);let s=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;s.push((a*o+(a+1)*l)/c),r.push(c)}return new Ft({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new Be(.5,.5)},direction:{value:new Be(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(e){return new Ft({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};Ha.BlurDirectionX=new Be(1,0);Ha.BlurDirectionY=new Be(0,1);var jM=3.5403451836554063,KM=4,YM=jM*KM,gf=YM/1e3,bs=Math.PI/180,m0=24.66;var ye=(i,e,t)=>i<e?e:i>t?t:i,nt=(i,e,t)=>i+(e-i)*t,xs=(i,e,t)=>{let n=ye((t-i)/(e-i),0,1);return n*n*(3-2*n)};var Kt=(i,e)=>1-Math.pow(.5,e/i);function Yn(i,e,t){let n=Math.imul(i,374761393)+Math.imul(e,668265263)+Math.imul(t,2147483647)|0;return n=Math.imul(n^n>>>13,1274126177),n=(n^n>>>16)>>>0,n/4294967296}function Fh(i,e,t,n){let s=Math.imul(i,2246822507)^Math.imul(e,3266489909)^Math.imul(t,668265263)^Math.imul(n,374761393)|0;return s^=s>>>15,s=Math.imul(s,739982445),s^=s>>>12,s=Math.imul(s,695872825),s^=s>>>15,s>>>0}function Ys(i,e,t,n){switch(i&15){case 0:return e+t;case 1:return-e+t;case 2:return e-t;case 3:return-e-t;case 4:return e+n;case 5:return-e+n;case 6:return e-n;case 7:return-e-n;case 8:return t+n;case 9:return-t+n;case 10:return t-n;case 11:return-t-n;case 12:return e+t;case 13:return-t+n;case 14:return-e+t;default:return-t-n}}function Js(i,e,t){let n=Math.imul(i,2376512323)^Math.imul(e,3625334849)^Math.imul(t,3407524639)|0;return n=Math.imul(n^n>>>15,739982445),(n^n>>>13)>>>0}function Ln(i,e,t){let n=Math.floor(i),s=Math.floor(e),r=Math.floor(t),a=i-n,o=e-s,l=t-r,c=a*a*a*(a*(a*6-15)+10),h=o*o*o*(o*(o*6-15)+10),u=l*l*l*(l*(l*6-15)+10),d=Ys(Js(n,s,r),a,o,l),p=Ys(Js(n+1,s,r),a-1,o,l),g=Ys(Js(n,s+1,r),a,o-1,l),_=Ys(Js(n+1,s+1,r),a-1,o-1,l),v=Ys(Js(n,s,r+1),a,o,l-1),m=Ys(Js(n+1,s,r+1),a-1,o,l-1),x=Ys(Js(n,s+1,r+1),a,o-1,l-1),S=Ys(Js(n+1,s+1,r+1),a-1,o-1,l-1);return nt(nt(nt(d,p,c),nt(g,_,c),h),nt(nt(v,m,c),nt(x,S,c),h),u)}var Dn=()=>performance.now()/1e3,vf=1337;function Ga(){return vf=vf*16807%2147483647,(vf-1)/2147483646}var Nh=420,JM=`
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
    vec3 col = mix(zen, hor, h) * (0.06 + 0.84 * day);
    // dust aureole around the sun: warm white by day, blue when the sun is low
    float g = 0.80;
    float hg = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosT, 1.5) * 0.25;
    float wide = pow(max(cosT, 0.0), 6.0);
    vec3 aur = mix(vec3(1.0, 0.86, 0.66), vec3(0.34, 0.52, 0.92), smoothstep(0.30, 0.02, sunE));
    float sunUp = smoothstep(-0.10, 0.04, sunE);
    col += aur * (hg * 0.30 + wide * 0.16) * sunUp * (0.35 + 0.65 * h + 0.5 * low);
    // twilight glow hugging the horizon on the sun's side after sunset
    float tw = smoothstep(-0.34, -0.02, sunE) * (1.0 - sunUp);
    col += vec3(0.20, 0.25, 0.42) * tw * pow(max(cosT * 0.5 + 0.5, 0.0), 3.0) * (0.25 + h) * 0.55;
    // night floor so the ground is never pure black
    col += vec3(0.0035, 0.0040, 0.0060);
    // storms: flatten everything toward a dim ochre
    vec3 murk = vec3(0.50, 0.30, 0.16) * (0.06 + 0.60 * day);
    col = mix(col, murk, uDust * 0.88);
    // leaving the atmosphere: fade to space, keep a haze band along the limb
    space = 1.0 - exp(-max(uAlt, 0.0) / ${Nh.toFixed(1)});
    float camR = ${12e3.toFixed(1)} + uAlt;
    float b = camR * sqrt(max(1.0 - mu * mu, 0.0));           // closest approach of the ray to the centre
    float limb = (mu < 0.0 ? 1.0 : 0.0) * exp(-max(b - ${12e3.toFixed(1)}, 0.0) / ${(Nh*.55).toFixed(1)});
    limb = max(limb, exp(-max(uAlt, 0.0) / ${(Nh*2).toFixed(1)}) * h);
    col = mix(col, col * limb * 1.4, space);
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
`,bf=new Me,Uh=class{constructor(){this.uniforms={uSun:{value:new C(1,0,0)},uUp:{value:new C(0,1,0)},uAlt:{value:2},uDust:{value:0},uTime:{value:0},uSunDisc:{value:1}};let e=new Ft({uniforms:this.uniforms,side:nn,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!0,vertexShader:`
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * vec4((viewMatrix * vec4(position, 0.0)).xyz, 1.0);
          gl_Position = p.xyww;       // always at the far plane
        }`,fragmentShader:`
        varying vec3 vDir;
        uniform float uSunDisc;
        ${JM}
        void main() {
          vec3 v = normalize(vDir);
          float space;
          vec3 col = skyColor(v, space);
          float sunE = dot(uSun, uUp);
          float night = 1.0 - smoothstep(-0.20, 0.06, sunE);
          float starVis = max(night, space) * (1.0 - uDust) * smoothstep(-0.06, 0.12, dot(v, uUp) + space);
          col += stars(v, starVis) * 0.9;
          // the sun: a small hard disc (0.35 degrees across on Mars) with a tight halo
          float cosT = dot(v, uSun);
          float ang = acos(clamp(cosT, -1.0, 1.0));
          float disc = smoothstep(0.0046, 0.0030, ang);
          float halo = exp(-ang * 60.0) * 0.6 + exp(-ang * 14.0) * 0.08;
          float through = (1.0 - uDust * 0.93) * smoothstep(-0.03, 0.03, sunE);
          vec3 sunCol = mix(vec3(1.0, 0.93, 0.82), vec3(0.72, 0.84, 1.0), smoothstep(0.25, 0.0, sunE) * 0.7);
          col += sunCol * (disc * 90.0 * uSunDisc + halo * 6.0 * uSunDisc) * through;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`});this.mesh=new Et(new Ar(1,32,16),e),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-1e3,this.mesh.name="sky",this.sunColor=new Me,this.ambientSky=new Me,this.ambientGround=new Me,this.fogColor=new Me,this.sunIntensity=1,this.day=1}update(e,t,n,s){let r=this.uniforms;r.uSun.value.copy(e),r.uUp.value.copy(t).normalize(),r.uAlt.value=t.length()-12e3,r.uDust.value=n,r.uTime.value=s,this.mesh.position.copy(t);let a=e.dot(r.uUp.value),o=xs(-.16,.1,a),l=1-xs(0,.45,a);this.day=o,this.sunE=a;let c=xs(-.04,.16,a);this.sunIntensity=3.3*c*(1-n*.86),this.sunColor.setRGB(nt(.8,1,1-l*.6),nt(.8,.93,1-l),nt(.86,.8,1-l));let h=.06+.84*o;this.ambientSky.setRGB(nt(.54,.28,l)*h,nt(.36,.22,l)*h,nt(.22,.19,l)*h),this.ambientGround.setRGB(.3*h*(.3+.7*c),.15*h*(.3+.7*c),.08*h*(.3+.7*c)),this.fogColor.setRGB(nt(.8,.4,l)*h,nt(.54,.3,l)*h,nt(.33,.25,l)*h),this.ambientSky.offsetHSL(0,0,.004),n>0&&(bf.setRGB(.5*(.06+.6*o),.3*(.06+.6*o),.16*(.06+.6*o)),this.fogColor.lerp(bf,n*.88),this.ambientSky.lerp(bf,n*.7));let u=1-Math.exp(-Math.max(r.uAlt.value,0)/Nh);this.space=u,this.fogColor.multiplyScalar(1-u*.85)}};var g0={low:{scale:.6,msaa:0,shadow:1024,shadowRange:45,bloom:!1,grid:24,maxLevel:8,split:1,fine:!1,workers:2,rocks:.5,terrainShadowLevels:0},medium:{scale:.8,msaa:2,shadow:2048,shadowRange:60,bloom:!0,grid:32,maxLevel:8,split:1.15,fine:!0,workers:2,rocks:.8,terrainShadowLevels:1},high:{scale:1,msaa:4,shadow:2048,shadowRange:75,bloom:!0,grid:32,maxLevel:9,split:1.3,fine:!0,workers:3,rocks:1,terrainShadowLevels:2},ultra:{scale:1,msaa:4,shadow:4096,shadowRange:95,bloom:!0,grid:48,maxLevel:9,split:1.6,fine:!0,workers:4,rocks:1.3,terrainShadowLevels:2}},$M=`
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
  }`,xf=class extends Kn{constructor(){super(),this.uniforms={tDiffuse:{value:null},uExposure:{value:1},uTime:{value:0},uVignette:{value:.32},uGrain:{value:.018},uSaturation:{value:1.06},uTint:{value:new C(1,1,1)},uDanger:{value:0},uCold:{value:0},uFade:{value:0}},this.material=new Ft({uniforms:this.uniforms,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:$M,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.quad=new Ks(this.material)}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(this.renderToScreen?null:t),this.quad.render(e)}dispose(){this.material.dispose(),this.quad.dispose()}},Va=new C,Wa=new C,Oh=new C,qa=new C,WA=new Me,kh=class{constructor(e,t){this.qualityName=t,this.q=g0[t]||g0.medium;let n=this.renderer=new Ah({antialias:!1,powerPreference:"high-performance",stencil:!1,alpha:!1});n.outputColorSpace=zt,n.toneMapping=oi,n.shadowMap.enabled=!0,n.shadowMap.type=Dc,n.domElement.className="mg-three",e.insertBefore(n.domElement,e.firstChild),this.dpr=Math.min(window.devicePixelRatio||1,2),this.dynScale=1,this.scene=new ya,this.camera=new en(60,1,.12,6e4),this.scene.add(this.camera),this.sky=new Uh,this.scene.add(this.sky.mesh),this.scene.fog=new To(13208155,.0012),this.sunDir=new C(1,0,0),this.sun=new Ir(16777215,3),this.sun.castShadow=!0;let s=this.sun.shadow;s.mapSize.set(this.q.shadow,this.q.shadow),s.bias=-35e-5,s.normalBias=.035,s.radius=2.2,this.scene.add(this.sun,this.sun.target),this.hemi=new ko(16777215,16777215,1),this.scene.add(this.hemi);let r=n.getDrawingBufferSize(new Be),a=new jt(Math.max(1,r.x),Math.max(1,r.y),{type:sn,samples:this.q.msaa});this.composer=new Lh(n,a),this.renderPass=new Dh(this.scene,this.camera),this.composer.addPass(this.renderPass),this.q.bloom&&(this.bloom=new Ha(new Be(256,256),.22,.55,1.15),this.composer.addPass(this.bloom)),this.final=new xf,this.composer.addPass(this.final),this.pmrem=new ka(n),this.envScene=new ya,this.envSky=new Et(this.sky.mesh.geometry,this.sky.mesh.material),this.envSky.frustumCulled=!1,this.envGround=new Et(new Ar(40,24,8,0,Math.PI*2,Math.PI*.5,Math.PI*.5),new dn({color:8405024,side:nn,fog:!1,toneMapped:!1})),this.envScene.add(this.envSky,this.envGround),this.env={target:null,sunE:9,dust:9,up:new C,age:9},this.exposure=1,this.time=0,this.resize(),window.addEventListener("resize",()=>this.resize()),window.visualViewport&&window.visualViewport.addEventListener("resize",()=>this.resize())}resize(){let e=window.innerWidth,t=window.innerHeight,n=this.dpr*this.q.scale*this.dynScale;this.renderer.setPixelRatio(n),this.renderer.setSize(e,t),this.composer.setPixelRatio(n),this.composer.setSize(e,t),this.camera.aspect=e/t,this.baseFov=ye(2*Math.atan(Math.tan(88*Math.PI/360)/this.camera.aspect)*180/Math.PI,46,66),this.camera.updateProjectionMatrix()}adaptResolution(e,t){let n=this.dynScale;e>t*1.18?n=Math.max(.55,n-.05):e<t*.82&&(n=Math.min(1,n+.03)),Math.abs(n-this.dynScale)>.001&&(this.dynScale=n,this.resize())}update(e){let t=this.camera,n=this.sky;this.time+=e.dt,n.update(this.sunDir,t.position,e.dust||0,this.time);let s=n.sunIntensity<.02;this.sun.color.copy(n.sunColor),this.sun.intensity=e.sealed?0:Math.max(n.sunIntensity,0),Wa.copy(e.focus||t.position).normalize(),this._fitShadow(e.focus||t.position,Wa,s||!!e.sealed),this.indoor=nt(this.indoor||0,e.inside?1:0,Kt(.35,e.dt||.016));let r=e.power===!1?.08:1;this.hemi.color.setRGB(.5*r,.46*r,.4*r),this.hemi.groundColor.setRGB(.26*r,.24*r,.21*r),this.hemi.intensity=this.indoor,this.hemi.position.copy(Wa),this._updateEnvironment(e.dt||.016,e.dust||0),this.scene.environmentIntensity=nt(1,.12,this.indoor);let a=this.scene.fog;a.color.copy(n.fogColor);let o=Math.max(0,t.position.length()-12e3);a.density=(85e-5+(e.dust||0)*.011)*Math.exp(-o/500)+15e-7;let l=(e.inside?.95:nt(3.4,1.12,n.day))*(e.exposureBias||1);this.exposure=nt(this.exposure,l,Kt(.9,e.dt));let c=this.final.uniforms;c.uExposure.value=this.exposure,c.uTime.value=this.time,t.near=o>400?2:.12,t.far=6e4}_fitShadow(e,t,n){let s=this.q.shadowRange,r=this.sun,a=r.shadow.camera;r.castShadow=!n,qa.copy(this.sunDir).negate(),Oh.crossVectors(Math.abs(qa.y)>.95?Va.set(1,0,0):Va.set(0,1,0),qa).normalize(),Wa.crossVectors(qa,Oh).normalize();let o=2*s/r.shadow.mapSize.x,l=Math.round(e.dot(Oh)/o)*o,c=Math.round(e.dot(Wa)/o)*o,h=e.dot(qa);Va.set(0,0,0).addScaledVector(Oh,l).addScaledVector(Wa,c).addScaledVector(qa,h),r.target.position.copy(Va),r.position.copy(Va).addScaledVector(this.sunDir,400),r.target.updateMatrixWorld(),a.right!==s&&(a.left=-s,a.right=s,a.top=s,a.bottom=-s,a.near=10,a.far=800,a.updateProjectionMatrix())}_updateEnvironment(e,t){let n=this.env,s=this.sky;n.age+=e;let r=s.uniforms.uUp.value,a=Math.abs(s.sunE-n.sunE)>.012||Math.abs(t-n.dust)>.04||r.distanceToSquared(n.up)>4e-4;if(n.target&&(!a||n.age<1.2))return;n.sunE=s.sunE,n.dust=t,n.up.copy(r),n.age=0;let o=s.sunIntensity*Math.max(s.sunE,0)/Math.PI;this.envGround.material.color.setRGB(.42*(o*s.sunColor.r+s.ambientSky.r*.6),.21*(o*s.sunColor.g+s.ambientSky.g*.6),.11*(o*s.sunColor.b+s.ambientSky.b*.6)),this.envGround.quaternion.setFromUnitVectors(Va.set(0,1,0),r);let l=s.uniforms.uSunDisc.value;s.uniforms.uSunDisc.value=.25;let c=n.target;n.target=this.pmrem.fromScene(this.envScene,0,.1,100,{size:this.q.scale<.7?64:128}),s.uniforms.uSunDisc.value=l,this.scene.environment=n.target.texture,c&&c.dispose()}render(){let e=this.renderer.info;e.autoReset=!1,e.reset(),this.composer.render(),this.frameStats={calls:e.render.calls,triangles:e.render.triangles}}info(){let e=this.renderer.info,t=this.frameStats||{calls:0,triangles:0};return{calls:t.calls,triangles:t.triangles,geometries:e.memory.geometries,textures:e.memory.textures,scale:+(this.q.scale*this.dynScale).toFixed(2)}}};var ci=Uint8Array,Xa=Uint16Array,ZM=Int32Array,v0=new ci([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),b0=new ci([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),QM=new ci([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),x0=function(i,e){for(var t=new Xa(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var s=new ZM(t[30]),n=1;n<30;++n)for(var r=t[n];r<t[n+1];++r)s[r]=r-t[n]<<5|n;return{b:t,r:s}},y0=x0(v0,2),_0=y0.b,ew=y0.r;_0[28]=258,ew[258]=28;var S0=x0(b0,0),tw=S0.b,XA=S0.r,Sf=new Xa(32768);for(bt=0;bt<32768;++bt)ys=(bt&43690)>>1|(bt&21845)<<1,ys=(ys&52428)>>2|(ys&13107)<<2,ys=(ys&61680)>>4|(ys&3855)<<4,Sf[bt]=((ys&65280)>>8|(ys&255)<<8)>>1;var ys,bt,il=(function(i,e,t){for(var n=i.length,s=0,r=new Xa(e);s<n;++s)i[s]&&++r[i[s]-1];var a=new Xa(e);for(s=1;s<e;++s)a[s]=a[s-1]+r[s-1]<<1;var o;if(t){o=new Xa(1<<e);var l=15-e;for(s=0;s<n;++s)if(i[s])for(var c=s<<4|i[s],h=e-i[s],u=a[i[s]-1]++<<h,d=u|(1<<h)-1;u<=d;++u)o[Sf[u]>>l]=c}else for(o=new Xa(n),s=0;s<n;++s)i[s]&&(o[s]=Sf[a[i[s]-1]++]>>15-i[s]);return o}),sl=new ci(288);for(bt=0;bt<144;++bt)sl[bt]=8;var bt;for(bt=144;bt<256;++bt)sl[bt]=9;var bt;for(bt=256;bt<280;++bt)sl[bt]=7;var bt;for(bt=280;bt<288;++bt)sl[bt]=8;var bt,M0=new ci(32);for(bt=0;bt<32;++bt)M0[bt]=5;var bt;var nw=il(sl,9,1);var iw=il(M0,5,1),yf=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},wi=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},_f=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},sw=function(i){return(i+7)/8|0},rw=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new ci(i.subarray(e,t))};var aw=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Ti=function(i,e,t){var n=new Error(e||aw[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,Ti),!t)throw n;return n},ow=function(i,e,t,n){var s=i.length,r=n?n.length:0;if(!s||e.f&&!e.l)return t||new ci(0);var a=!t,o=a||e.i!=2,l=e.i;a&&(t=new ci(s*3));var c=function(Oe){var st=t.length;if(Oe>st){var lt=new ci(Math.max(st*2,Oe));lt.set(t),t=lt}},h=e.f||0,u=e.p||0,d=e.b||0,p=e.l,g=e.d,_=e.m,v=e.n,m=s*8;do{if(!p){h=wi(i,u,1);var x=wi(i,u+1,3);if(u+=3,x)if(x==1)p=nw,g=iw,_=9,v=5;else if(x==2){var M=wi(i,u,31)+257,b=wi(i,u+10,15)+4,w=M+wi(i,u+5,31)+1;u+=14;for(var L=new ci(w),I=new ci(19),N=0;N<b;++N)I[QM[N]]=wi(i,u+N*3,7);u+=b*3;for(var k=yf(I),V=(1<<k)-1,D=il(I,k,1),N=0;N<w;){var q=D[wi(i,u,V)];u+=q&15;var S=q>>4;if(S<16)L[N++]=S;else{var K=0,z=0;for(S==16?(z=3+wi(i,u,3),u+=2,K=L[N-1]):S==17?(z=3+wi(i,u,7),u+=3):S==18&&(z=11+wi(i,u,127),u+=7);z--;)L[N++]=K}}var se=L.subarray(0,M),X=L.subarray(M);_=yf(se),v=yf(X),p=il(se,_,1),g=il(X,v,1)}else Ti(1);else{var S=sw(u)+4,y=i[S-4]|i[S-3]<<8,R=S+y;if(R>s){l&&Ti(0);break}o&&c(d+y),t.set(i.subarray(S,R),d),e.b=d+=y,e.p=u=R*8,e.f=h;continue}if(u>m){l&&Ti(0);break}}o&&c(d+131072);for(var Y=(1<<_)-1,ee=(1<<v)-1,he=u;;he=u){var K=p[_f(i,u)&Y],de=K>>4;if(u+=K&15,u>m){l&&Ti(0);break}if(K||Ti(2),de<256)t[d++]=de;else if(de==256){he=u,p=null;break}else{var J=de-254;if(de>264){var N=de-257,re=v0[N];J=wi(i,u,(1<<re)-1)+_0[N],u+=re}var Se=g[_f(i,u)&ee],Ie=Se>>4;Se||Ti(3),u+=Se&15;var X=tw[Ie];if(Ie>3){var re=b0[Ie];X+=_f(i,u)&(1<<re)-1,u+=re}if(u>m){l&&Ti(0);break}o&&c(d+131072);var le=d+J;if(d<X){var Xe=r-X,Mt=Math.min(X,le);for(Xe+d<0&&Ti(3);d<Mt;++d)t[d]=n[Xe+d]}for(;d<le;++d)t[d]=t[d-X]}}e.l=p,e.p=he,e.b=d,e.f=h,p&&(h=1,e.m=_,e.d=g,e.n=v)}while(!h);return d!=t.length&&a?rw(t,0,d):t.subarray(0,d)};var lw=new ci(0);var cw=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&Ti(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&Ti(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function Bh(i,e){return ow(i.subarray(cw(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var hw=typeof TextDecoder<"u"&&new TextDecoder,uw=0;try{hw.decode(lw,{stream:!0}),uw=1}catch{}var rl=Math.PI/4,w0=4/Math.PI,Gh=1.5;function T0(i){let e=new Uint8Array(i),t=new DataView(i);if(String.fromCharCode(e[0],e[1],e[2],e[3])!=="MH01")throw new Error("Not a Mars height file");let n=t.getUint32(4,!0),s=JSON.parse(new TextDecoder().decode(e.subarray(8,8+n))),r=8+n,a=s.n+2*s.pad,o=[];for(let c of s.faces){let h=Bh(e.subarray(r,r+c.lo));r+=c.lo;let u=Bh(e.subarray(r,r+c.hi));r+=c.hi;let d=new Int16Array(a*a);for(let p=0,g=0;p<a;p++)for(let _=0;_<a;_++,g++){let v=h[g]|u[g]<<8,m=v>>>1^-(v&1),x;if(p===0)x=_===0?0:d[g-1];else if(_===0)x=d[g-a];else{let S=d[g-1],y=d[g-a],R=d[g-a-1],M=S<y?S:y,b=S<y?y:S;x=R>=b?M:R<=M?b:S+y-R}d[g]=x+m}o.push(d)}let l=null;if(s.rough){l={m:s.rough.m,pad:s.rough.pad,faces:[]};for(let c of s.rough.sizes)l.faces.push(Bh(e.subarray(r,r+c))),r+=c}return{n:s.n,pad:s.pad,q:s.q,faces:o,rough:l}}function Ya(i,e,t,n){let s=e===1?1:e===-1?-1:Math.tan(e*rl),r=t===1?1:t===-1?-1:Math.tan(t*rl),a,o,l;switch(i){case 0:a=1,o=-r,l=-s;break;case 1:a=-1,o=-r,l=s;break;case 2:a=s,o=1,l=r;break;case 3:a=s,o=-1,l=-r;break;case 4:a=s,o=-r,l=1;break;default:a=-s,o=-r,l=-1}let c=1/Math.sqrt(a*a+o*o+l*l);return n[0]=a*c,n[1]=o*c,n[2]=l*c,n}var Hi=0,ja=0,Ka=0,Ei=0,Ai=0;function Mf(i,e,t){let n=i<0?-i:i,s=e<0?-e:e,r=t<0?-t:t;n>=s&&n>=r?i>0?(Hi=0,Ei=-t/n,Ai=-e/n):(Hi=1,Ei=t/n,Ai=-e/n):s>=r?e>0?(Hi=2,Ei=i/s,Ai=t/s):(Hi=3,Ei=i/s,Ai=-t/s):t>0?(Hi=4,Ei=i/r,Ai=-e/r):(Hi=5,Ei=-i/r,Ai=-e/r),ja=Math.atan(Ei)*w0,Ka=Math.atan(Ai)*w0}var dw=[64,32,16,8],zh=12e3*rl,Hh=class{constructor(e){this.n=e.n,this.pad=e.pad,this.size=e.n+2*e.pad,this.faces=e.faces,this.unit=e.q*gf,this.rough=e.rough,this.rsize=e.rough?e.rough.m+2*e.rough.pad:0,this.pads=[]}addPad(e,t,n,s,r){let a=this.radius(e,t,n,12),o={x:e,y:t,z:n,r:s,blend:r,h:a,cos:Math.cos((s+r)/12e3)};return this.pads.push(o),o}_pad(e,t,n,s){let r=this.pads;for(let a=0;a<r.length;a++){let o=r[a],l=e*o.x+t*o.y+n*o.z;if(l<=o.cos)continue;let c=Math.sqrt(Math.max(0,2-2*l))*12e3;if(c>=o.r+o.blend)continue;let h=c<=o.r?1:1-(c-o.r)/o.blend;h=h*h*(3-2*h),s+=(o.h-s)*h}return s}elevationMetres(e,t,n){return Mf(e,t,n),this._mola()/gf}roughness(e,t,n){return Mf(e,t,n),this._rough()}radius(e,t,n,s=Gh){Mf(e,t,n);let r=this._mola(),a=this._rough(),o=12e3+r+this._detail(e,t,n,a,s);return this.pads.length?this._pad(e,t,n,o):o}radiusFace(e,t,n,s,r,a,o){Hi=e,ja=t,Ka=n,Ei=Math.tan(t*rl),Ai=Math.tan(n*rl);let l=this._mola(),c=this._rough(),h=12e3+l+this._detail(s,r,a,c,o);return this.pads.length?this._pad(s,r,a,h):h}_mola(){let e=this.n,t=this.size,n=this.faces[Hi],s=(ja+1)*.5*e-.5+this.pad,r=(Ka+1)*.5*e-.5+this.pad;s<1?s=1:s>t-2.0001&&(s=t-2.0001),r<1?r=1:r>t-2.0001&&(r=t-2.0001);let a=Math.floor(s),o=Math.floor(r),l=s-a,c=r-o,h=l*l,u=h*l,d=c*c,p=d*c,g=(-u+2*h-l)*.5,_=(3*u-5*h+2)*.5,v=(-3*u+4*h+l)*.5,m=(u-h)*.5,x=(-p+2*d-c)*.5,S=(3*p-5*d+2)*.5,y=(-3*p+4*d+c)*.5,R=(p-d)*.5,M=(o-1)*t+a-1,b=n[M]*g+n[M+1]*_+n[M+2]*v+n[M+3]*m;M+=t;let w=n[M]*g+n[M+1]*_+n[M+2]*v+n[M+3]*m;M+=t;let L=n[M]*g+n[M+1]*_+n[M+2]*v+n[M+3]*m;M+=t;let I=n[M]*g+n[M+1]*_+n[M+2]*v+n[M+3]*m;return(b*x+w*S+L*y+I*R)*this.unit}_rough(){let e=this.rough;if(!e)return .35;let t=e.m,n=this.rsize,s=e.faces[Hi],r=(ja+1)*.5*t-.5+e.pad,a=(Ka+1)*.5*t-.5+e.pad,o=Math.floor(r),l=Math.floor(a);o<0?o=0:o>n-2&&(o=n-2),l<0?l=0:l>n-2&&(l=n-2);let c=ye(r-o,0,1),h=ye(a-l,0,1),u=l*n+o,d=s[u]+(s[u+1]-s[u])*c,p=s[u+n]+(s[u+n+1]-s[u+n])*c;return(d+(p-d)*h)/255}_detail(e,t,n,s,r){let a=e*12e3,o=t*12e3,l=n*12e3,c=.8+7*s*s,h=0,u=96,d=c;for(let M=0;M<6&&!(u<=r);M++){let b=u>=2*r?1:(u-r)/r,w=1/u,L=Ln(a*w+M*19.19,o*w-M*7.3,l*w+M*3.7);(M===1||M===2)&&(L=(1-Math.abs(L)*1.6)*.7-.2),h+=L*d*b,u*=.5,d*=.52}if(r<14&&s<.42){let M=Ln(a/700+31.7,o/700,l/700-12.9);if(M>.05){let b=ye((M-.05)*4,0,1)*ye((.42-s)*6,0,1),w=r<=7?1:(14-r)/7,L=Math.asin(ye(t,-1,1))*12e3,I=Ln(a/55,o/55,l/55)*9+Ln(a/17+5,o/17,l/17)*2.2,N=(L+I)/15,k=Math.abs(N-Math.floor(N)-.5)*2;if(h+=(1-Math.pow(k,.75))*1.15*b*w,r<2.5){let V=(L*1.03+I*.35)/2.4;h+=(.5-Math.abs(V-Math.floor(V)-.5))*.12*b}}}let p=1+Ei*Ei,g=1+Ai*Ai,_=p+g-1,v=zh*p*Math.sqrt(g)/_,m=zh*g*Math.sqrt(p)/_,x=v*v,S=m*m,y=-v*m*Ei*Ai/Math.sqrt(p*g),R=.1+.5*s;for(let M=0;M<4;M++){let b=dw[M];if(b<=r)break;let w=b>=2*r?1:(b-r)/r,L=4*b/zh,I=ja/L,N=Ka/L,k=Math.floor(I),V=Math.floor(N);for(let D=-1;D<=1;D++)for(let q=-1;q<=1;q++){let K=k+q,z=V+D,se=Fh(K,z,Hi,M+11);if((se&1023)/1023>R)continue;let X=(se>>>10&1023)/1023*.5+.25,Y=(se>>>20&1023)/1023*.5+.25,ee=(K+X)*L,he=(z+Y)*L,de=b*(.5+.5*(se>>>5&31)/31),J=1-de*2.1/zh;if(ee>J||ee<-J||he>J||he<-J)continue;let re=ja-ee,Se=Ka-he,Ie=(x*re*re+2*y*re*Se+S*Se*Se)/(de*de);if(Ie>=4)continue;let le=.18+.82*Math.pow((se>>>15&31)/31,2.2),Xe=de*.36*le,Mt=de*.075*le,Oe;if(Ie<1)Oe=(Mt+Xe)*Math.pow(Ie,1.15)-Xe;else{let st=Math.sqrt(Ie),lt=2-st;Oe=Mt*lt*lt*lt/(st*st)}h+=Oe*w}}return h}};var fw=new URL(".",import.meta.url),$s=i=>new URL(i,fw).href;async function pw(i,e){let t=await fetch(i);if(!t.ok)throw new Error(`Could not load ${i} (${t.status})`);let n=Number(t.headers.get("content-length"))||0;if(!t.body||!n){let o=await t.arrayBuffer();return e&&e(1),o}let s=t.body.getReader(),r=new Uint8Array(n),a=0;for(;;){let{done:o,value:l}=await s.read();if(o)break;if(a+l.length>r.length){let c=new Uint8Array(a+l.length);c.set(r.subarray(0,a)),c.set(l,a);let h=new Uint8Array(await new Response(s.stream?s.stream:t.body).arrayBuffer().catch(()=>new ArrayBuffer(0))),u=new Uint8Array(c.length+h.length);return u.set(c),u.set(h,c.length),u.buffer}r.set(l,a),a+=l.length,e&&e(a/n)}return r.buffer.slice(0,a)}function mw(i){return new Promise((e,t)=>{let n=new Image;n.decoding="async",n.onload=()=>e(n),n.onerror=()=>t(new Error(`Could not load ${i}`)),n.src=i})}function gw(i,e){let t=i.naturalWidth/3,n=Math.min(t,e||t),s=[];for(let a=0;a<6;a++){let o=document.createElement("canvas");o.width=o.height=n,o.getContext("2d").drawImage(i,a%3*t,Math.floor(a/3)*t,t,t,0,0,n,n),s.push(o)}let r=new Tr(s);return r.colorSpace=zt,r.generateMipmaps=!0,r.minFilter=_n,r.magFilter=Ht,r.needsUpdate=!0,r}async function E0(i,e={}){let t=(c,h)=>{i&&i(c,h)},n=mw($s("assets/mars/color.jpg")),s=await pw($s("assets/mars/height.bin"),c=>t(c*.8,"Receiving orbital survey"));t(.82,"Unpacking elevation"),await new Promise(c=>setTimeout(c,0));let r=T0(s),a=new Hh(r);t(.9,"Loading colour survey");let o=await n,l=gw(o,e.maxColorFace);return t(1,"Ready"),{planet:a,heightData:r,albedoCube:l}}var A0=Math.PI/4,Ja=64,xt=[0,0,0];function vw(i,e){return 2/(1<<i)*12e3*A0/e}function wf(i){return 2/(1<<i)*12e3*A0}function Tf(i,e,t,n,s,r,a){let o=vw(t,r),l=Math.max(Gh,o*1.25),c=r+3,h=new Float64Array(c*c),u=new Float64Array(c*c),d=new Float64Array(c*c),p=1/0,g=-1/0,_=r<<t,v=2/_,m=n*r-1,x=s*r-1;for(let Y=0,ee=0;Y<c;Y++){let he=x+Y,de=he===0?-1:he===_?1:-1+he*v;for(let J=0;J<c;J++,ee++){let re=m+J,Se=re===0?-1:re===_?1:-1+re*v;Ya(e,Se,de,xt);let le=re<=0||re>=_||he<=0||he>=_?i.radius(xt[0],xt[1],xt[2],l):i.radiusFace(e,Se,de,xt[0],xt[1],xt[2],l);h[ee]=xt[0]*le,u[ee]=xt[1]*le,d[ee]=xt[2]*le,J>0&&Y>0&&J<c-1&&Y<c-1&&(le<p&&(p=le),le>g&&(g=le))}}let S=(r/2+1)*c+(r/2+1),y=h[S],R=u[S],M=d[S],b=Math.floor(y/Ja)*Ja,w=Math.floor(R/Ja)*Ja,L=Math.floor(M/Ja)*Ja,I=(r+1)*(r+1),N=4*r,k=new Float32Array((I+N)*3),V=new Int8Array((I+N)*3),D=new Float32Array((I+N)*3),q=0;for(let Y=0,ee=0;Y<=r;Y++)for(let he=0;he<=r;he++,ee++){let de=(Y+1)*c+(he+1),J=h[de],re=u[de],Se=d[de],Ie=J-y,le=re-R,Xe=Se-M;k[ee*3]=Ie,k[ee*3+1]=le,k[ee*3+2]=Xe,D[ee*3]=J-b,D[ee*3+1]=re-w,D[ee*3+2]=Se-L;let Mt=Ie*Ie+le*le+Xe*Xe;Mt>q&&(q=Mt);let Oe=h[de+1]-h[de-1],st=u[de+1]-u[de-1],lt=d[de+1]-d[de-1],rt=h[de+c]-h[de-c],Yt=u[de+c]-u[de-c],Vt=d[de+c]-d[de-c],ln=Yt*lt-Vt*st,Ct=Vt*Oe-rt*lt,Nn=rt*st-Yt*Oe,Wt=127/Math.sqrt(ln*ln+Ct*Ct+Nn*Nn);V[ee*3]=Math.round(ln*Wt),V[ee*3+1]=Math.round(Ct*Wt),V[ee*3+2]=Math.round(Nn*Wt)}let K=o*2+.5,z=I,se=(Y,ee)=>{let he=ee*(r+1)+Y,de=(ee+1)*c+(Y+1),J=Math.sqrt(h[de]*h[de]+u[de]*u[de]+d[de]*d[de]),re=K/J;k[z*3]=k[he*3]-h[de]*re,k[z*3+1]=k[he*3+1]-u[de]*re,k[z*3+2]=k[he*3+2]-d[de]*re,V[z*3]=V[he*3],V[z*3+1]=V[he*3+1],V[z*3+2]=V[he*3+2],D[z*3]=D[he*3],D[z*3+1]=D[he*3+1],D[z*3+2]=D[he*3+2],z++};for(let Y=0;Y<r;Y++)se(Y,0);for(let Y=0;Y<r;Y++)se(r,Y);for(let Y=r;Y>0;Y--)se(Y,r);for(let Y=r;Y>0;Y--)se(0,Y);let X={pos:k,nor:V,tex:D,origin:[y,R,M],radius:Math.sqrt(q)+K,minR:p,maxR:g};return a&&(X.rocks=bw(i,e,t,n,s,a,y,R,M)),X}function R0(i){let e=[],t=(a,o)=>o*(i+1)+a;for(let a=0;a<i;a++)for(let o=0;o<i;o++){let l=t(o,a),c=t(o+1,a),h=t(o,a+1),u=t(o+1,a+1);e.push(l,h,c,c,h,u)}let n=(i+1)*(i+1),s=[];for(let a=0;a<i;a++)s.push(t(a,0));for(let a=0;a<i;a++)s.push(t(i,a));for(let a=i;a>0;a--)s.push(t(a,i));for(let a=i;a>0;a--)s.push(t(0,a));let r=s.length;for(let a=0;a<r;a++){let o=s[a],l=s[(a+1)%r],c=n+a,h=n+(a+1)%r;e.push(o,l,c,l,h,c)}return new Uint16Array(e)}function bw(i,e,t,n,s,r,a,o,l){let c=2/(1<<t),h=-1+n*c,u=-1+s*c,d=wf(t);Ya(e,h+c/2,u+c/2,xt);let p=i.roughness(xt[0],xt[1],xt[2]),g=Ln(xt[0]*12e3/260+7.7,xt[1]*12e3/260,xt[2]*12e3/260-3.1),_=Math.min(1,Math.max(0,(g+.15)*1.8)),v=Math.abs(xt[1]),m=r==="big"?(8e-4+.0075*p*p)*(.15+.85*_):(.03+.13*p)*(.35+.65*_);v>.97&&(m*=.15);let x=Math.min(r==="big"?120:230,Math.floor(d*d*m)),S=new Float32Array(x*8),y=Fh(n,s,e,t*7+(r==="big"?1:2)),R=()=>{y=y+1831565813|0;let w=Math.imul(y^y>>>15,1|y);return w=w+Math.imul(w^w>>>7,61|w)^w,((w^w>>>14)>>>0)/4294967296},M=0,b=i.pads;for(let w=0;w<x;w++){let L=h+R()*c,I=u+R()*c,N=R(),k=R();Ya(e,L,I,xt);let V=!0;for(let K=0;K<b.length;K++){let z=b[K];if(xt[0]*z.x+xt[1]*z.y+xt[2]*z.z>Math.cos((z.r+z.blend*.35)/12e3)){V=!1;break}}if(!V)continue;let D=r==="big"?Math.min(4.2,.42*Math.pow(1-N*.985,-.5)):.09+.36*N*N,q=i.radiusFace(e,L,I,xt[0],xt[1],xt[2],Gh)-D*.08;S[M++]=xt[0]*q-a,S[M++]=xt[1]*q-o,S[M++]=xt[2]*q-l,S[M++]=xt[0],S[M++]=xt[1],S[M++]=xt[2],S[M++]=D,S[M++]=k}return M===S.length?S:S.slice(0,M)}var Vh=[0,0,0],xw=new C,kr=class{constructor(e,t,n,s,r){this.face=e,this.level=t,this.ix=n,this.iy=s,this.parent=r,this.children=null,this.mesh=null,this.state=0,this.used=0;let a=2/(1<<t);Ya(e,-1+(n+.5)*a,-1+(s+.5)*a,Vh),this.dir=new C(Vh[0],Vh[1],Vh[2]),this.center=this.dir.clone().multiplyScalar(12e3),this.size=wf(t),this.radius=this.size*.75,this.angle=this.size*.71/12e3,this.maxR=r?r.maxR+6:12320}},Wh=class{constructor(e){this.planet=e.planet,this.parent=e.parent,this.material=e.material,this.G=e.grid||32,this.maxLevel=e.maxLevel||9,this.split=e.split||2.4,this.shadowLevel=e.shadowLevel===void 0?7:e.shadowLevel,this.rockLevels={big:Math.min(7,this.maxLevel-1),small:this.maxLevel},this.index=new ut(R0(this.G),1),this.roots=[];for(let n=0;n<6;n++)this.roots.push(new kr(n,0,0,0,null));this.frame=0,this.pending=new Map,this.queue=[],this.nextId=1,this.ready=[],this.live=0,this.cacheLimit=e.cacheLimit||420,this.visible=[],this.onChunk=null,this.onDispose=null,this.workers=[],this.idle=[];let t=e.workers===void 0?2:e.workers;for(let n=0;n<t;n++){let s;try{s=new Worker(e.workerUrl)}catch{break}s.onmessage=r=>this._onMessage(s,r.data),s.onerror=()=>{this._workerFailed(s)},s.postMessage({type:"init",data:e.heightData}),this.workers.push(s)}this.sync=this.workers.length===0}_workerFailed(e){let t=this.workers.indexOf(e);t>=0&&this.workers.splice(t,1);let n=this.idle.indexOf(e);n>=0&&this.idle.splice(n,1),this.workers.length||(this.sync=!0);for(let[s,r]of this.pending)r._worker===e&&(this.pending.delete(s),r.state=0)}_onMessage(e,t){if(t.type==="ready"){this.idle.push(e);return}if(t.type==="chunk"){this.idle.push(e);let n=this.pending.get(t.id);this.pending.delete(t.id),n&&this.ready.push([n,t]),this._dispatch(!0)}}_rockKind(e){return e===this.rockLevels.big?"big":e===this.rockLevels.small?"small":null}_request(e,t){e.state===0&&(e.state=1,e.priority=t,this.queue.push(e))}_dispatch(e){if(this.queue.length){if(this.sync){if(e)return;this.queue.sort((t,n)=>t.priority-n.priority);for(let t=0;t<2&&this.queue.length;t++){let n=this.queue.shift();this.ready.push([n,Tf(this.planet,n.face,n.level,n.ix,n.iy,this.G,this._rockKind(n.level))])}return}if(this.idle.length){for(e||this.queue.sort((t,n)=>t.priority-n.priority);this.idle.length&&this.queue.length;){let t=this.queue.shift();if(t.used<this.frame-2){t.state=0;continue}let n=this.idle.pop(),s=this.nextId++;t._worker=n,this.pending.set(s,t),n.postMessage({type:"build",id:s,face:t.face,level:t.level,ix:t.ix,iy:t.iy,G:this.G,rocks:this._rockKind(t.level)})}if(this.queue.length>64)for(let t of this.queue.splice(64))t.state=0}}}_adopt(e,t){let n=new Lt;n.setAttribute("position",new ut(t.pos,3)),n.setAttribute("normal",new ut(t.nor,3,!0)),n.setAttribute("aTex",new ut(t.tex,3)),n.setIndex(this.index),n.boundingSphere=new xn(new C(0,0,0),t.radius);let s=new Et(n,this.material);s.position.set(t.origin[0],t.origin[1],t.origin[2]),s.matrixAutoUpdate=!1,s.updateMatrix(),s.receiveShadow=!0,s.castShadow=e.level>=this.shadowLevel,s.visible=!1,this.parent.add(s),e.mesh=s,e.state=2,e.center.set(t.origin[0],t.origin[1],t.origin[2]),e.radius=t.radius,e.maxR=t.maxR,this.live++,this.onChunk&&this.onChunk(e,t)}_drop(e){e.mesh&&(this.onDispose&&this.onDispose(e),this.parent.remove(e.mesh),e.mesh.geometry.dispose(),e.mesh=null,this.live--),e.state=0}_localFloor(e,t,n){let s=11870;if((this.frame&7)!==1&&this._floor!==void 0)return this._floor;let r=this.planet.radius(t.x,t.y,t.z,12);if(n-r>250)return this._floor=s;let a=r,o=-t.z,l=t.x,c=Math.hypot(o,l)||1;o/=c,l/=c;let h=t.y*l,u=t.z*o-t.x*l,d=-t.y*o;for(let p of[120,320,650,1050,1500]){let g=p/12e3;for(let _=0;_<12;_++){let v=_/12*Math.PI*2+p,m=Math.cos(v)*g,x=Math.sin(v)*g,S=t.x+o*m+h*x,y=t.y+u*x,R=t.z+l*m+d*x,M=1/Math.hypot(S,y,R),b=this.planet.radius(S*M,y*M,R*M,24);b<a&&(a=b)}}return this._floor=Math.max(s,a-18)}_hidden(e,t,n,s){let r=Math.acos(Math.min(1,Math.max(-1,t.dot(e.dir)))),a=s+Math.acos(Math.min(1,this.floorR/e.maxR))+e.angle;return r>a}update(e){this.frame++;for(let r=0;r<12&&this.ready.length;r++){let[a,o]=this.ready.shift();a.state===1&&this._adopt(a,o)}let t=e.length(),n=xw.copy(e).multiplyScalar(1/t);this.floorR=this._localFloor(e,n,t);let s=Math.acos(Math.min(1,this.floorR/Math.max(t,this.floorR+1)));for(let r of this.visible)r.mesh.visible=!1;this.visible.length=0,this.missing=0;for(let r of this.roots)this._visit(r,e,n.clone(),t,s);for(let r of this.visible)r.mesh.visible=!0;return this._dispatch(),this.live>this.cacheLimit&&(this.frame&31)===0&&this._prune(),this.missing+this.ready.length}_visit(e,t,n,s,r){e.used=this.frame;let a=Math.max(0,t.distanceTo(e.center)-e.radius*.5),o=e.level<this.maxLevel&&a<e.size*this.split;if(e.level>1&&this._hidden(e,n,s,r))return!0;if(e.state===0&&this._request(e,a/e.size+e.level*.01),o){if(!e.children){let c=e.level+1,h=e.ix*2,u=e.iy*2;e.children=[new kr(e.face,c,h,u,e),new kr(e.face,c,h+1,u,e),new kr(e.face,c,h,u+1,e),new kr(e.face,c,h+1,u+1,e)]}let l=!0;for(let c of e.children)c.used=this.frame,!(c.level>1&&this._hidden(c,n,s,r))&&c.state!==2&&(l=!1,c.state===0&&this._request(c,t.distanceTo(c.center)/c.size+c.level*.01));if(l){for(let c of e.children)this._visit(c,t,n,s,r);return!0}this.missing++}return e.state===2?(this.visible.push(e),!0):(this.missing++,!1)}_prune(){let e=[],t=s=>{if(s.children)for(let r of s.children)t(r);s.level>0&&s.state===2&&s.used<this.frame-90&&e.push(s)};for(let s of this.roots)t(s);e.sort((s,r)=>s.used-r.used);for(let s=0;s<e.length&&this.live>this.cacheLimit*.8;s++)this._drop(e[s]);let n=s=>{if(!s.children)return s.state===0&&s.used<this.frame-90;let r=!0;for(let a of s.children)n(a)||(r=!1);return r&&(s.children=null),r&&s.state===0&&s.used<this.frame-90};for(let s of this.roots)n(s)}syncPads(e=[]){for(let r of this.workers)r.postMessage({type:"pads",pads:this.planet.pads});if(!e.length)return;let t=r=>e.some(a=>Math.acos(Math.min(1,Math.max(-1,r.dir.x*a.x+r.dir.y*a.y+r.dir.z*a.z)))<r.angle+(a.r+a.blend)/12e3),n=r=>{if(r.children)for(let a of r.children)n(a);r.state!==0&&t(r)&&(r._stale=!0)};for(let r of this.roots)n(r);let s=r=>{if(r.children)for(let a of r.children)s(a);r._stale&&r.state===2?(r._stale=!1,this._rebuild(r)):r._stale&&(r._stale=!1)};for(let r of this.roots)s(r)}_rebuild(e){let t=Tf(this.planet,e.face,e.level,e.ix,e.iy,this.G,this._rockKind(e.level)),n=e.mesh;this.onDispose&&this.onDispose(e),this.parent.remove(n),n.geometry.dispose(),this.live--,e.mesh=null,this._adopt(e,t),e.mesh.visible=n.visible}async settle(e,t=2e4){let n=performance.now();for(;;){if(this.update(e)===0&&!this.queue.length&&!this.pending.size)return!0;if(performance.now()-n>t)return!1;await new Promise(r=>setTimeout(r,12))}}stats(){let e={};for(let t of this.visible)e[t.level]=(e[t.level]||0)+1;return{visible:this.visible.length,live:this.live,terrainTris:this.visible.length*this.index.count/3,levels:e,queued:this.queue.length,pending:this.pending.size}}};function yw(i=256,e=0){let n=new Float32Array(i*i),s=new Float32Array(i*i),r=(c,h,u,d)=>{let p=c/u,g=h/u,_=Ln(c,h,d),v=Ln(c-u,h,d),m=Ln(c,h-u,d),x=Ln(c-u,h-u,d);return(_*(1-p)+v*p)*(1-g)+(m*(1-p)+x*p)*g};for(let c=0;c<i;c++)for(let h=0;h<i;h++){let u=h/i*8,d=c/i*8,p=0,g=.5,_=1;for(let m=0;m<5;m++)p+=r(u*_,d*_,8*_,e+m*3.1)*g,g*=.55,_*=2;n[c*i+h]=p;let v=r(u*6,d*6,48,e+40.5);s[c*i+h]=Math.max(0,v-.42)*3.2}let a=new Uint8Array(i*i*4),o=(c,h)=>n[(h+i)%i*i+(c+i)%i]+s[(h+i)%i*i+(c+i)%i]*.5;for(let c=0;c<i;c++)for(let h=0;h<i;h++){let u=(c*i+h)*4,d=(o(h+1,c)-o(h-1,c))*i/32,p=(o(h,c+1)-o(h,c-1))*i/32;a[u]=Math.max(0,Math.min(255,128+d*127)),a[u+1]=Math.max(0,Math.min(255,128+p*127)),a[u+2]=Math.max(0,Math.min(255,128+n[c*i+h]*200)),a[u+3]=Math.max(0,Math.min(255,s[c*i+h]*255))}let l=new Gs(a,i,i,Bn);return l.wrapS=l.wrapT=Fi,l.minFilter=_n,l.magFilter=Ht,l.generateMipmaps=!0,l.anisotropy=4,l.needsUpdate=!0,l}function C0(i,e={}){let t=yw(e.detailSize||256),n=new Xn({color:16777215,roughness:.94,metalness:0});return n.userData.uniforms={uAlbedo:{value:i},uDetail:{value:t},uDust:{value:0}},n.defines=n.defines||{},e.fine!==!1&&(n.defines.TERRAIN_FINE=""),n.onBeforeCompile=s=>{Object.assign(s.uniforms,n.userData.uniforms),s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
        attribute vec3 aTex;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        vTex = aTex;
        vPlanetPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vGeoNormal = normalize(normal);`),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
        uniform samplerCube uAlbedo;
        uniform sampler2D uDetail;
        uniform float uDust;
        varying vec3 vTex;
        varying vec3 vPlanetPos;
        varying vec3 vGeoNormal;
        // one detail layer, projected along the three world axes and blended by the normal
        // returns: xyz = world-space height gradient, w = height (0..1); pebbles in 'peb'
        vec4 triLayer(vec3 p, vec3 w, float scale, out float peb) {
          vec4 tx = texture2D(uDetail, p.zy * scale);
          vec4 ty = texture2D(uDetail, p.xz * scale);
          vec4 tz = texture2D(uDetail, p.xy * scale);
          vec2 gx = tx.rg * 2.0 - 1.0, gy = ty.rg * 2.0 - 1.0, gz = tz.rg * 2.0 - 1.0;
          vec3 grad = w.x * vec3(0.0, gx.y, gx.x) + w.y * vec3(gy.x, 0.0, gy.y) + w.z * vec3(gz.x, gz.y, 0.0);
          peb = dot(w, vec3(tx.a, ty.a, tz.a));
          return vec4(grad, dot(w, vec3(tx.b, ty.b, tz.b)));
        }`).replace("#include <map_fragment>",`
        vec3 pDir = normalize(vPlanetPos);
        vec3 geoN = normalize(vGeoNormal);
        float viewDist = length(vViewPosition);
        // real colour of this spot on Mars, graded from orbital imagery toward surface colour
        vec3 alb = textureCube(uAlbedo, pDir).rgb;
        float albLum = dot(alb, vec3(0.3, 0.55, 0.15));
        alb = mix(vec3(albLum), alb, 1.15) * vec3(1.16, 0.94, 0.77);
        float ice = smoothstep(0.50, 0.72, albLum) * smoothstep(0.80, 0.95, abs(pDir.y));
        float slope = 1.0 - clamp(dot(geoN, pDir), 0.0, 1.0);
        vec3 tw = pow(abs(geoN), vec3(4.0));
        tw /= (tw.x + tw.y + tw.z);
        float peb0, peb1, peb2;
        float fMid = 1.0 - smoothstep(60.0, 260.0, viewDist);
        float fFar = 1.0 - smoothstep(500.0, 2200.0, viewDist);
        vec4 dFar = triLayer(vTex, tw, 1.0 / 32.0, peb2);
        vec4 dMid = triLayer(vTex, tw, 1.0 / 4.0, peb1);
        vec3 grad = dFar.xyz * 0.9 * fFar + dMid.xyz * 0.7 * fMid;
        float hgt = (dFar.w - 0.5) * fFar + (dMid.w - 0.5) * 0.6 * fMid;
        float pebbles = peb1 * fMid;
        #ifdef TERRAIN_FINE
          float fFine = 1.0 - smoothstep(6.0, 28.0, viewDist);
          vec4 dFine = triLayer(vTex, tw, 2.0, peb0);
          grad += dFine.xyz * 0.55 * fFine;
          hgt += (dFine.w - 0.5) * 0.35 * fFine;
          pebbles = max(pebbles, peb0 * fFine);
        #endif
        // rock shows through where it is steep; dust settles where it is flat
        float rock = smoothstep(0.10, 0.42, slope + hgt * 0.12);
        vec3 rockCol = alb * vec3(0.55, 0.50, 0.50);
        vec3 col = mix(alb, rockCol, rock * 0.75);
        col *= 1.0 + hgt * 0.30;
        col = mix(col, col * vec3(0.50, 0.44, 0.42), clamp(pebbles, 0.0, 1.0) * 0.8);
        col = mix(col, vec3(0.80, 0.84, 0.90), ice);
        col = mix(col, vec3(dot(col, vec3(0.33)) * 1.1) * vec3(1.15, 0.93, 0.72), uDust * 0.5);
        diffuseColor.rgb = col;
        float terrainRough = mix(0.97, 0.88, rock) - ice * 0.5;
        vec3 terrainGrad = grad * (1.0 - ice * 0.6);`).replace("#include <roughnessmap_fragment>","float roughnessFactor = clamp(terrainRough, 0.05, 1.0);").replace("#include <normal_fragment_begin>",`#include <normal_fragment_begin>
        {
          vec3 wn = geoN;
          vec3 gT = terrainGrad - wn * dot(terrainGrad, wn);
          wn = normalize(wn - gT * 1.35);
          normal = normalize((viewMatrix * vec4(wn, 0.0)).xyz);
        }`)},n.customProgramCacheKey=()=>"terrain"+(e.fine!==!1?"F":""),n}function kt(i,e,t=new C){let n=i*bs,s=e*bs;return t.set(Math.cos(n)*Math.cos(s),Math.sin(n),-Math.cos(n)*Math.sin(s))}function Jn(i){let e=Math.hypot(i.x,i.y,i.z)||1;return{lat:Math.asin(ye(i.y/e,-1,1))/bs,lon:(Math.atan2(-i.z,i.x)/bs+360)%360}}function Mn(i,e,t,n,s,r){let a=i-n,o=e-s,l=t-r;return 2*Math.asin(ye(Math.sqrt(a*a+o*o+l*l)/2,0,1))}var qh=new C,Xh=new C;function it(i,e){return qh.copy(i).normalize(),Xh.copy(e).normalize(),Mn(qh.x,qh.y,qh.z,Xh.x,Xh.y,Xh.z)*12e3}function hi(i,e,t){e.set(-i.z,0,i.x),e.lengthSq()<1e-10&&e.set(1,0,0),e.normalize(),t.crossVectors(i,e)}var P0=new C,I0=new C,Ef=new C,L0=new C,D0=new qe;function Gi(i,e,t=new ht){return hi(i,P0,I0),Ef.copy(I0).multiplyScalar(Math.cos(e)).addScaledVector(P0,Math.sin(e)),L0.crossVectors(i,Ef),D0.makeBasis(L0,i,Ef),t.setFromRotationMatrix(D0)}function ui(i){return i>999?(i/1e3).toFixed(1)+" km":Math.round(i)+" m"}var ce={engine:null,planet:null,terrain:null,world:null,mapImage:null};var di=new C,Vi=new C,pR=new C,wn=new C,zn=new C,Hn=new C,Ce=new C,Ve=new C,Ge=new C,jh=new C,fi=new ht,_s=new ht,al=new C(0,1,0),ol=new C(1,0,0);function At(i){let e=1/Math.hypot(i.x,i.y,i.z);return ce.planet.radius(i.x*e,i.y*e,i.z*e)}function F0(i,e,t){return ce.planet.elevationMetres(i,e,t)/1e3}function N0(i,e=40){hi(i,zn,Hn);let t=At(i),n=0;for(let[s,r]of[[1,0],[-1,0],[0,1],[0,-1]])wn.copy(i).addScaledVector(zn,s*e/12e3).addScaledVector(Hn,r*e/12e3).normalize(),n=Math.max(n,Math.abs(At(wn)-t)/e);return n}function Jh(i,e,t){let n=1/Math.hypot(i.x,i.y,i.z),s=i.x*n,r=i.y*n,a=i.z*n;wn.set(s,r,a),hi(wn,zn,Hn);let o=e/12e3,l=ce.planet.radius(...Yh(s+zn.x*o,r+zn.y*o,a+zn.z*o))-ce.planet.radius(...Yh(s-zn.x*o,r-zn.y*o,a-zn.z*o)),c=ce.planet.radius(...Yh(s+Hn.x*o,r+Hn.y*o,a+Hn.z*o))-ce.planet.radius(...Yh(s-Hn.x*o,r-Hn.y*o,a-Hn.z*o)),h=l/(2*e),u=c/(2*e),d=Math.hypot(h,u);return t&&(d>1e-6?t.copy(zn).multiplyScalar(-h/d).addScaledVector(Hn,-u/d):t.set(0,0,0)),d}var Kh=[0,0,0];function Yh(i,e,t){let n=1/Math.hypot(i,e,t);return Kh[0]=i*n,Kh[1]=e*n,Kh[2]=t*n,Kh}var $n={story:{name:"BOTANIST",rescueSol:20,drain:.75,desc:`Rescue: Sol 20. Forgiving drains,
storms always forecast. See Mars, grow spuds.`},survival:{name:"ENGINEER",rescueSol:45,drain:1,desc:`Rescue: Sol 45. The intended experience.
Provision your expeditions or die packing.`},iron:{name:"SPACE PIRATE",rescueSol:60,drain:1.15,desc:`Rescue: Sol 60. Death rewinds nothing \u2014
one life, whole planet, no complaints.`}},f={started:!1,uiOpen:!1,over:!1,won:!1,sleeping:!1,firstPerson:!1,mode:"walk",diff:"survival",rescueSol:45,drainMult:1,sol:1,tod:.02,o2:100,water:42,food:10,potatoes:0,power:72,health:100,suit:46,roverPower:100,roverO2:300,hydrazine:3,inv:{scrap:0,circuit:0,regolith:0,ice:0,candle:0,kitSolar:0,kitGreenhouse:0,kitBeacon:0,kitCache:0},upgrades:{},blueprints:{drill:!1,drive2:!1,tank2:!1,recycler:!1},inside:!1,storm:{i:0,cells:[]},breach:{active:!1,done:!1,cropsKilled:!1,timer:0},pf:{found:!1,loaded:!1,connected:!1},disco:!1,discovered:{},salvaged:{},achieved:{},quests:{},checkedSystems:{},flags:{coldOpen:!0,suitSealed:!1,didMath:!1,hydrazineBoom:!1,pfRevealed:!1,mavRevealed:!1,mavStripped:!1,nasaMsg:0,routePods:!1},stats:{potatoes:0,panels:0,walked:0,driven:0,closeCalls:0,booms:0,mined:0,crafted:0,discoveries:0,discoTime:0,stormOut:0},holdT:0,shake:0,dead:null},Pe={solLen:220,o2Drain:22,o2Gen:42,o2BreachDrain:210,waterMax:120,waterDrain:6,waterRecl:4.5,waterPerDose:5,hydrazineWater:28,iceWater:10,powerMax:100,powerBase:34,solarGen:118,dustRate:.05,stormDustRate:.7,stormGenMult:.14,potatoYield:4,growSols:2.4,waterings:2,healthMax:100,starveDrain:16,suffocateDrain:10,healRegen:4,sleepHeal:10,walkSpeed:5.1,runSpeed:9.2,jumpV:3.4,gravity:3.72,suitCap:100,roverO2Cap:300,roverPowerCap:100,roverDrainPerMin:5,roverChargeAtHab:25};function Zt(){return f.upgrades.tank2?200:f.upgrades.tank1?150:Pe.suitCap}function Af(){return f.upgrades.drive2?55:f.upgrades.drive1?45:35}function Zs(){return f.upgrades.roverBattery?160:Pe.roverPowerCap}var Ss=document.createElement("div");Ss.id="mg-root";document.body.appendChild(Ss);function gt(i,e,t,n,s){let r=document.createElement(i);return e&&(r.id=e),t&&(r.className=t),s!==void 0&&(r.innerHTML=s),(n||Ss).appendChild(r),r}var Z={};Z.vitals=gt("div","mg-vitals","mg-hud");var _w=[["suit","SUIT O2","#7fd4ff"],["o2","HAB O2","#9fd49f"],["water","H2O","#6fb7ff"],["food","FOOD","#d8c26f"],["power","PWR","#7fca7f"],["health","VITALS","#ff8f7f"]];Z.bars={};for(let[i,e,t]of _w){let n=gt("div",null,"mg-bar",Z.vitals);n.innerHTML=`<div class="lb"><span>${e}</span><span class="val"></span></div>
    <div class="tk"><div class="fl" style="background:${t}"></div></div>`,Z.bars[i]={wrap:n,fill:n.querySelector(".fl"),val:n.querySelector(".val")}}Z.clock=gt("div","mg-clock","mg-hud");Z.compass=gt("div","mg-compass","mg-hud");Z.region=gt("div","mg-region","mg-hud");Z.objectives=gt("div","mg-objectives","mg-hud");Z.keys=gt("div","mg-keys","mg-hud",null,'<span class="mg-kbd">M</span> MAP \xB7 <span class="mg-kbd">C</span> COLONY \xB7 <span class="mg-kbd">J</span> JOURNAL');Z.log=gt("div","mg-log","mg-hud");Z.prompt=gt("div","mg-prompt","mg-hud");Z.promptText=gt("div",null,null,Z.prompt);Z.promptSub=gt("div",null,"sub",Z.prompt);Z.hold=gt("div","mg-hold",null,Z.prompt,'<div class="fl"></div>');Z.holdFill=Z.hold.querySelector(".fl");Z.crosshair=gt("div","mg-crosshair","mg-hud",null,"+");Z.vign=gt("div","mg-vign","mg-hud");Z.cold=gt("div","mg-cold","mg-hud");Z.flash=gt("div","mg-flash","mg-hud");Z.toast=gt("div","mg-toast","mg-hud");Z.overlay=gt("div","mg-overlay",null);Z.panel=gt("div","mg-panel",null,Z.overlay);Z.touch=gt("div","mg-touch",null,Ss);Z.joy=gt("div","mg-joy",null,Z.touch);Z.joyKnob=gt("div","mg-joyknob",null,Z.joy);Z.tE=gt("div","mg-tE","mg-tbtn",Z.touch,"HOLD");Z.tJump=gt("div","mg-tJump","mg-tbtn",Z.touch,"JUMP");Z.tSprint=gt("div","mg-tSprint","mg-tbtn",Z.touch,"RUN");Z.tExit=gt("div","mg-tExit","mg-tbtn",Z.touch,"EXIT");Z.tRow=gt("div","mg-trow",null,Z.touch,'<div class="mg-tbtn" data-t="map">MAP</div><div class="mg-tbtn" data-t="colony">CRAFT</div><div class="mg-tbtn" data-t="journal">LOG</div><div class="mg-tbtn" data-t="cam">CAM</div>');Z.mapScreen=gt("div","mg-map","mg-screen",Ss,'<h1>MARS \xB7 ORBITAL SURVEY</h1><div class="close">\u2715 CLOSE</div><div id="mg-map-wrap"><canvas id="mg-mapcanvas"></canvas><div id="mg-maplegend"></div></div>');Z.colonyScreen=gt("div","mg-colony2","mg-screen",Ss,'<h1>COLONY \xB7 INVENTORY & FABRICATION</h1><div class="close">\u2715 CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-inv"></div><div class="mg-col" id="mg-craft"></div><div class="mg-col" id="mg-build"></div></div>');Z.journalScreen=gt("div","mg-journal","mg-screen",Ss,'<h1>MISSION JOURNAL</h1><div class="close">\u2715 CLOSE</div><div class="mg-cols"><div class="mg-col" id="mg-quests"></div><div class="mg-col" id="mg-discoveries"></div><div class="mg-col" id="mg-achievements"></div></div>');Z.mapCanvas=Z.mapScreen.querySelector("#mg-mapcanvas");function pi(i){let e=(i.buttons||[]).map((t,n)=>`<button data-i="${n}" class="${t.ghost?"ghost":""}">${t.label}</button>`).join("");Z.panel.innerHTML=(i.title?`<h1>${i.title}</h1>`:"")+(i.subtitle?`<h2>${i.subtitle}</h2>`:"")+`<div class="bd">${i.body||""}</div>`+(e?`<div class="btns">${e}</div>`:""),Z.overlay.style.display="flex",f.uiOpen=!0;try{document.exitPointerLock&&document.exitPointerLock()}catch{}Z.panel.querySelectorAll("button").forEach(t=>{t.onclick=n=>{n.stopPropagation();let s=i.buttons[+t.dataset.i];s.keep!==!0&&Br(),s.fn&&s.fn()}})}function Br(){Z.overlay.style.display="none",f.uiOpen=!1}var U0=null;function ll(i,e,t){Z.toast.innerHTML=`<div class="t1">${i}</div><div class="t2">${e}</div>`+(t?`<div class="t3">${t}</div>`:""),Z.toast.style.display="block",clearTimeout(U0),U0=setTimeout(()=>{Z.toast.style.display="none"},6e3)}function Ne(i,e){let t=gt("div",null,"mg-line"+(e?" "+e:""),Z.log),n=0,r=(e==="nasa"?"[NASA] ":e==="sys"?"[HAB] ":e==="disc"?"[SURVEY] ":"[LOG] ")+i,a=setInterval(()=>{n+=2,t.textContent=r.slice(0,n),n>=r.length&&(clearInterval(a),setTimeout(()=>{t.classList.add("fade"),setTimeout(()=>t.remove(),1400)},9500))},16);for(;Z.log.children.length>5;)Z.log.firstChild.remove()}function cl(i,e){Z.flash.style.background=i,Z.flash.style.opacity=1,setTimeout(()=>{Z.flash.style.transition="opacity .6s",Z.flash.style.opacity=0,setTimeout(()=>{Z.flash.style.transition=""},700)},e)}var Te={ctx:null,master:null,windGain:null,rumbleGain:null,discoTimer:null,alarmTimer:null,_lastWind:-1,_lastRumble:-1,init(){if(!this.ctx)try{let i=window.AudioContext||window.webkitAudioContext;if(!i)return;this.ctx=new i,this.master=this.ctx.createGain(),this.master.gain.value=.5,this.master.connect(this.ctx.destination);let e=this.ctx.sampleRate*2,t=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=t.getChannelData(0);for(let r=0;r<e;r++)n[r]=Math.random()*2-1;this.noiseBuf=t;let s=(r,a)=>{let o=this.ctx.createBufferSource();o.buffer=t,o.loop=!0;let l=this.ctx.createBiquadFilter();l.type=a,l.frequency.value=r,l.Q.value=.6;let c=this.ctx.createGain();return c.gain.value=0,o.connect(l),l.connect(c),c.connect(this.master),o.start(),c};this.windGain=s(260,"bandpass"),this.rumbleGain=s(110,"lowpass")}catch{this.ctx=null}},resume(){try{this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}catch{}},_ramp(i,e,t,n){if(!(!i||Math.abs(t-this[e])<.01)){this[e]=t;try{i.gain.cancelScheduledValues(this.ctx.currentTime),i.gain.linearRampToValueAtTime(t,this.ctx.currentTime+n)}catch{}}},wind(i){this._ramp(this.windGain,"_lastWind",ye(i,0,1)*.5,.6)},rumble(i){this._ramp(this.rumbleGain,"_lastRumble",ye(i,0,1),.3)},beep(i,e,t,n){if(this.ctx)try{let s=this.ctx.createOscillator(),r=this.ctx.createGain();s.type=t||"sine",s.frequency.value=i,r.gain.setValueAtTime(n||.18,this.ctx.currentTime),r.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+(e||.15)),s.connect(r),r.connect(this.master),s.start(),s.stop(this.ctx.currentTime+(e||.15)+.02)}catch{}},click(){this.beep(900,.05,"square",.06)},ok(){this.beep(620,.09,"sine",.14),setTimeout(()=>this.beep(930,.14,"sine",.14),90)},pickup(){this.beep(500,.06,"triangle",.14),setTimeout(()=>this.beep(750,.08,"triangle",.12),70)},craft(){[392,494,587].forEach((i,e)=>setTimeout(()=>this.beep(i,.12,"triangle",.13),e*90))},jingle(){[523,659,784,1047].forEach((i,e)=>setTimeout(()=>this.beep(i,.22,"triangle",.16),e*130))},discovery(){[659,880,1109,1319].forEach((i,e)=>setTimeout(()=>this.beep(i,.3,"sine",.13),e*160))},bad(){this.beep(220,.3,"sawtooth",.16)},boom(){if(this.ctx)try{let i=this.ctx.createBufferSource();i.buffer=this.noiseBuf;let e=this.ctx.createBiquadFilter();e.type="lowpass",e.frequency.setValueAtTime(900,this.ctx.currentTime),e.frequency.exponentialRampToValueAtTime(60,this.ctx.currentTime+1.1);let t=this.ctx.createGain();t.gain.setValueAtTime(.9,this.ctx.currentTime),t.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+1.3),i.connect(e),e.connect(t),t.connect(this.master),i.start(),i.stop(this.ctx.currentTime+1.4)}catch{}},alarm(i){if(i&&!this.alarmTimer){let e=()=>{this.beep(740,.18,"square",.1),setTimeout(()=>this.beep(520,.18,"square",.1),250)};e(),this.alarmTimer=setInterval(e,900)}else!i&&this.alarmTimer&&(clearInterval(this.alarmTimer),this.alarmTimer=null)},disco(i){if(i&&!this.discoTimer){let e=[110,110,147,110,165,147,110,98],t=[440,0,523,440,0,587,523,0],n=0;this.discoTimer=setInterval(()=>{this.beep(e[n%8],.16,"sawtooth",.09),t[n%8]&&this.beep(t[n%8],.1,"square",.045),n%2===0&&this.beep(60,.08,"sine",.22),n++},210)}else!i&&this.discoTimer&&(clearInterval(this.discoTimer),this.discoTimer=null)}};function Rf(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},a={},o=i[0].morphTargetsRelative,l=new Lt;l.morphTargetsRelative=o;let c=0;for(let h=0;h<i.length;++h){let u=i[h],d=0,p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let g in u.attributes){if(!n.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+g+'" attribute exists among all geometries, or in none of them.'),null;r[g]===void 0&&(r[g]=[]),r[g].push(u.attributes[g]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let g in u.morphAttributes){if(!s.has(g))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;if(u.morphAttributes[g].length!==i[0].morphAttributes[g].length)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have the same number of morph targets for the "'+g+'" morph attribute.'),null;a[g]===void 0&&(a[g]=[]),a[g].push(u.morphAttributes[g]),p++}if(p!==s.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of morph attributes."),null;if(e){let g;if(t)g=u.index.count;else if(u.attributes.position!==void 0)g=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,g,h),c+=g}}if(t){let h=0,u=[];for(let d=0;d<i.length;++d){let p=i[d].index;for(let g=0;g<p.count;++g)u.push(p.getX(g)+h);h+=i[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=O0(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let p=[];for(let _=0;_<a[h].length;++_)p.push(a[h][_][d]);let g=O0(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}}return l}function O0(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let h=i[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let a=new e(r),o=new ut(a,t,n),l=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let d=0,p=h.count;d<p;d++)for(let g=0;g<t;g++){let _=h.getComponent(d,g);o.setComponent(d+u,g,_)}}else a.set(h.array,l);l+=h.count*t}return s!==void 0&&(o.gpuType=s),o}function Cf(i,e){if(e===Bd)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Na||e===$o){let t=i.getIndex();if(t===null){let r=[],a=i.getAttribute("position");if(a!==void 0){for(let o=0;o<a.count;o++)r.push(o);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Na)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function $h(i){let e=new Map,t=new Map,n=i.clone();return k0(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function k0(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)k0(i.children[n],e.children[n],t)}var Zh=class extends Ui{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Uf(t)}),this.register(function(t){return new Of(t)}),this.register(function(t){return new kf(t)}),this.register(function(t){return new jf(t)}),this.register(function(t){return new Kf(t)}),this.register(function(t){return new Yf(t)}),this.register(function(t){return new zf(t)}),this.register(function(t){return new Hf(t)}),this.register(function(t){return new Gf(t)}),this.register(function(t){return new Vf(t)}),this.register(function(t){return new Nf(t)}),this.register(function(t){return new Wf(t)}),this.register(function(t){return new Bf(t)}),this.register(function(t){return new Xf(t)}),this.register(function(t){return new qf(t)}),this.register(function(t){return new Df(t)}),this.register(function(t){return new Qh(t,ot.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Qh(t,ot.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new Jf(t)})}load(e,t,n,s){let r=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let c=ms.extractUrlBase(e);a=ms.resolveURL(c,this.path)}else a=ms.extractUrlBase(e);this.manager.itemStart(e);let o=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ra(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===V0){try{a[ot.KHR_BINARY_GLTF]=new $f(e)}catch(u){s&&s(u);return}r=JSON.parse(a[ot.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new sp(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case ot.KHR_MATERIALS_UNLIT:a[u]=new Ff;break;case ot.KHR_DRACO_MESH_COMPRESSION:a[u]=new Zf(r,this.dracoLoader);break;case ot.KHR_TEXTURE_TRANSFORM:a[u]=new Qf;break;case ot.KHR_MESH_QUANTIZATION:a[u]=new ep;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function Sw(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Gt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var ot={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Df=class{constructor(e){this.parser=e,this.name=ot.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new Me(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Pn);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Ir(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Pr(h),c.distance=u;break;case"spot":c=new fs(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Wi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}},Ff=class{constructor(){this.name=ot.KHR_MATERIALS_UNLIT}getMaterialType(){return dn}extendParams(e,t,n){let s=[];e.color=new Me(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Pn),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,zt))}return Promise.all(s)}},Nf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Uf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Be(r,r)}return Promise.all(s)}},Of=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(s)}},kf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},Bf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},zf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_SHEEN}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new Me(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Pn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,zt)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},Hf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Gf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_VOLUME}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Me().setRGB(r[0],r[1],r[2],Pn),Promise.all(s)}},Vf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_IOR}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Wf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new Me().setRGB(r[0],r[1],r[2],Pn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,zt)),Promise.all(s)}},qf=class{constructor(e){this.parser=e,this.name=ot.EXT_MATERIALS_BUMP}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},Xf=class{constructor(e){this.parser=e,this.name=ot.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Gt(this.parser,e,this.name)!==null?In:null}extendMaterialParams(e,t){let n=Gt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},jf=class{constructor(e){this.parser=e,this.name=ot.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}},Kf=class{constructor(e){this.parser=e,this.name=ot.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},Yf=class{constructor(e){this.parser=e,this.name=ot.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let a=r.extensions[t],o=s.images[a.source],l=n.textureLoader;if(o.uri){let c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}},Qh=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(p){return p.buffer}):a.ready.then(function(){let p=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(p),h,u,d,s.mode,s.filter),p})})}else return null}},Jf=class{constructor(e){this.name=ot.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==mi.TRIANGLES&&c.mode!==mi.TRIANGLE_STRIP&&c.mode!==mi.TRIANGLE_FAN&&c.mode!==void 0)return null;let a=n.extensions[this.name].attributes,o=[],l={};for(let c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,p=[];for(let g of u){let _=new qe,v=new C,m=new ht,x=new C(1,1,1),S=new os(g.geometry,g.material,d);for(let R=0;R<d;R++)l.TRANSLATION&&v.fromBufferAttribute(l.TRANSLATION,R),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,R),l.SCALE&&x.fromBufferAttribute(l.SCALE,R),S.setMatrixAt(R,_.compose(v,m,x));let y=null;for(let R in l)if(R==="_COLOR_0"){let M=l[R];S.instanceColor=new as(M.array,M.itemSize,M.normalized)}else if(R!=="TRANSLATION"&&R!=="ROTATION"&&R!=="SCALE"){if(y===null){let b=S.geometry;y=new Lt,y.name=b.name;for(let w in b.attributes)y.setAttribute(w,b.attributes[w]);for(let w in b.morphAttributes)y.morphAttributes[w]=b.morphAttributes[w];b.index!==null&&y.setIndex(b.index),y.morphTargetsRelative=b.morphTargetsRelative;for(let w of b.groups)y.addGroup(w.start,w.count,w.materialIndex);b.boundingBox!==null&&(y.boundingBox=b.boundingBox.clone()),b.boundingSphere!==null&&(y.boundingSphere=b.boundingSphere.clone()),y.drawRange.start=b.drawRange.start,y.drawRange.count=b.drawRange.count,y.userData=Object.assign({},b.userData),S.geometry=y}let M=l[R];y.setAttribute(R,new as(M.array,M.itemSize,M.normalized))}Tt.prototype.copy.call(S,g),this.parser.assignFinalMaterial(S),p.push(S)}return h.isGroup?(h.clear(),h.add(...p),h):p[0]}))}},V0="glTF",hl=12,B0={JSON:1313821514,BIN:5130562},$f=class{constructor(e){this.name=ot.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,hl),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==V0)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-hl,r=new DataView(e,hl),a=0;for(;a<s;){let o=r.getUint32(a,!0);a+=4;let l=r.getUint32(a,!0);if(a+=4,l===B0.JSON){let c=new Uint8Array(e,hl+a,o);this.content=n.decode(c)}else if(l===B0.BIN){let c=hl+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Zf=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ot.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(let h in a){let u=np[h]||h.toLowerCase();o[u]=a[h]}for(let h in e.attributes){let u=np[h]||h.toLowerCase();if(a[h]!==void 0){let d=n.accessors[e.attributes[h]],p=$a[d.componentType];c[u]=p.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(p){for(let g in p.attributes){let _=p.attributes[g],v=l[g];v!==void 0&&(_.normalized=v)}u(p)},o,c,Pn,d)})})}},Qf=class{constructor(){this.name=ot.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},ep=class{constructor(){this.name=ot.KHR_MESH_QUANTIZATION}},eu=class extends Ni{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=s-t,u=(n-t)/h,d=u*u,p=d*u,g=e*c,_=g-c,v=-2*p+3*d,m=p-d,x=1-v,S=m-d+u;for(let y=0;y!==o;y++){let R=a[_+y+o],M=a[_+y+l]*h,b=a[g+y+o],w=a[g+y]*h;r[y]=x*R+S*M+v*b+m*w}return r}},Mw=new ht,tp=class extends eu{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return Mw.fromArray(r).normalize().toArray(r),r}},mi={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},$a={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},z0={9728:Xt,9729:Ht,9984:Uc,9985:Da,9986:Fr,9987:_n},H0={33071:ri,33648:pa,10497:Fi},Pf={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},np={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Qs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},ww={CUBICSPLINE:void 0,LINEAR:yr,STEP:xr},If={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Tw(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Xn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Oi})),i.DefaultMaterial}function zr(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Wi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Ew(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;a.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;o.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function Aw(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Rw(i){let e,t=i.extensions&&i.extensions[ot.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Lf(t.attributes):e=i.indices+":"+Lf(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Lf(i.targets[n]);return e}function Lf(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function ip(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Cw(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var Pw=new qe,sp=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Sw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let l=o.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?(this.textureLoader=new Oo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new zo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ra(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){let o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return zr(r,o,s),Wi(o,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(let l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let a=t[s].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(a,o)=>{let l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(let[c,h]of a.children.entries())r(h,o.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ot.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,a){n.load(ms.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let a=Pf[s.type],o=$a[s.componentType],l=s.normalized===!0,c=new o(s.count*a);return Promise.resolve(new ut(c,a,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){let o=a[0],l=Pf[s.type],c=$a[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=s.byteOffset||0,p=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,_,v;if(p&&p!==u){let m=Math.floor(d/p),x="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count,S=t.cache.get(x);S||(_=new c(o,m*p,s.count*p/h),S=new _a(_,p/h),t.cache.add(x,S)),v=new Sa(S,l,d%p/h,g)}else o===null?_=new c(s.count*l):_=new c(o,d,s.count*l),v=new ut(_,l,g);if(s.sparse!==void 0){let m=Pf.SCALAR,x=$a[s.sparse.indices.componentType],S=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,R=new x(a[1],S,s.sparse.count*m),M=new c(a[2],y,s.sparse.count*l);o!==null&&(v=new ut(v.array.slice(),v.itemSize,v.normalized)),v.normalized=!1;for(let b=0,w=R.length;b<w;b++){let L=R[b];if(v.setX(L,M[b*l]),l>=2&&v.setY(L,M[b*l+1]),l>=3&&v.setZ(L,M[b*l+2]),l>=4&&v.setW(L,M[b*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}v.normalized=g}return v})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r],o=this.textureLoader;if(a.uri){let l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){let s=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);let d=(r.samplers||{})[a.sampler]||{};return h.magFilter=z0[d.magFilter]||Ht,h.minFilter=z0[d.minFilter]||_n,h.wrapS=H0[d.wrapS]||Fi,h.wrapT=H0[d.wrapT]||Fi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Xt&&h.minFilter!==Ht,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());let a=s.images[e],o=self.URL||self.webkitURL,l=a.uri||"",c=!1,h;if(t.isKTX2Loader===!0&&a.bufferView!==void 0)h=n.getDependency("bufferView",a.bufferView).then(function(d){return new Promise(function(p,g){t.parse(d,p,g)})});else{if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(d){c=!0;let p=new Blob([d],{type:a.mimeType});return l=o.createObjectURL(p),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");h=Promise.resolve(l).then(function(d){return new Promise(function(p,g){let _=p;t.isImageBitmapLoader===!0&&(_=function(v){let m=new tn(v);m.needsUpdate=!0,p(m)}),t.load(ms.resolveURL(d,r.path),_,void 0,g)})})}let u=h.then(function(d){return c===!0&&o.revokeObjectURL(l),Wi(d,a),d.userData.mimeType=a.mimeType||Cw(a.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ot.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[ot.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let l=r.associations.get(a);a=r.extensions[ot.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new Ta,Un.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,l=this.cache.get(o);l||(l=new wa,Un.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Xn}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],a,o={},l=r.extensions||{},c=[];if(l[ot.KHR_MATERIALS_UNLIT]){let u=s[ot.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{let u=r.pbrMetallicRoughness||{};if(o.color=new Me(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Pn),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,zt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=yn);let h=r.alphaMode||If.OPAQUE;if(h===If.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===If.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==dn&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new Be(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==dn&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==dn){let u=r.emissiveFactor;o.emissive=new Me().setRGB(u[0],u[1],u[2],Pn)}return r.emissiveTexture!==void 0&&a!==dn&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,zt)),Promise.all(c).then(function(){let u=new a(o);return r.name&&(u.name=r.name),Wi(u,r),t.associations.set(u,{materials:e}),r.extensions&&zr(s,u,r),u})}createUniqueName(e){let t=wt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[ot.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return G0(l,o,t)})}let a=[];for(let o=0,l=e.length;o<l;o++){let c=e[o],h=Rw(c),u=s[h];if(u)a.push(u.promise);else{let d;c.extensions&&c.extensions[ot.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=G0(new Lt,c,t),c.mode===mi.TRIANGLE_STRIP?d=d.then(p=>Cf(p,$o)):c.mode===mi.TRIANGLE_FAN&&(d=d.then(p=>Cf(p,Na))),s[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){let h=a[l].material===void 0?Tw(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let p=0,g=h.length;p<g;p++){let _=h[p],v=a[p],m,x=c[p];if(v.mode===mi.TRIANGLES||v.mode===mi.TRIANGLE_STRIP||v.mode===mi.TRIANGLE_FAN||v.mode===void 0){let S=r.isSkinnedMesh===!0,y=_.hasAttribute("skinIndex")&&_.hasAttribute("skinWeight");S&&y===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=S&&y?new Mr(_,x):new Et(_,x),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(v.mode===mi.LINES)m=new Co(_,x);else if(v.mode===mi.LINE_STRIP)m=new wr(_,x);else if(v.mode===mi.LINE_LOOP)m=new Po(_,x);else if(v.mode===mi.POINTS)m=new Ws(_,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+v.mode);Object.keys(m.geometry.morphAttributes).length>0&&Aw(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Wi(m,r),v.extensions&&zr(s,m,v),t.assignFinalMaterial(m),u.push(m)}for(let p=0,g=u.length;p<g;p++)t.associations.set(u[p],{meshes:e,primitives:p});if(u.length===1)return r.extensions&&zr(s,u[0],r),u[0];let d=new qt;r.extensions&&zr(s,d,r),t.associations.set(d,{meshes:e});for(let p=0,g=u.length;p<g;p++)d.add(u[p]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new en(wh.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new ps(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Wi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),a=s,o=[],l=[];for(let c=0,h=a.length;c<h;c++){let u=a[c];if(u){o.push(u);let d=new qe;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Ro(o,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let p=s.channels[u],g=s.samplers[p.sampler],_=p.target,v=_.node,m=s.parameters!==void 0?s.parameters[g.input]:g.input,x=s.parameters!==void 0?s.parameters[g.output]:g.output;_.node!==void 0&&(a.push(this.getDependency("node",v)),o.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",x)),c.push(g),h.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let d=u[0],p=u[1],g=u[2],_=u[3],v=u[4],m=[];for(let S=0,y=d.length;S<y;S++){let R=d[S],M=p[S],b=g[S],w=_[S],L=v[S];if(R===void 0)continue;R.updateMatrix&&R.updateMatrix();let I=n._createAnimationTracks(R,M,b,w,L);if(I)for(let N=0;N<I.length;N++)m.push(I[N])}let x=new Rr(r,void 0,m);return Wi(x,s),x})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=s.weights.length;l<c;l++)o.morphTargetInfluences[l]=s.weights[l]}),a})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){let h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(p){p.isSkinnedMesh&&p.bind(d,Pw)});for(let p=0,g=u.length;p<g;p++)h.add(u[p]);if(h.userData.pivot!==void 0&&u.length>0){let p=h.userData.pivot,g=u[0];h.pivot=new C().fromArray(p),h.position.x-=p[0],h.position.y-=p[1],h.position.z-=p[2],g.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(r.isBone===!0?h=new Ma:c.length>1?h=new qt:c.length===1?h=c[0]:h=new Tt,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=a),Wi(h,r),r.extensions&&zr(n,h,r),r.matrix!==void 0){let u=new qe;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new qt;n.name&&(r.name=s.createUniqueName(n.name)),Wi(r,n),n.extensions&&zr(t,r,n);let a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(s.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++){let d=l[h];d.parent!==null?r.add($h(d)):r.add(d)}let c=h=>{let u=new Map;for(let[d,p]of s.associations)(d instanceof Un||d instanceof tn)&&u.set(d,p);return h.traverse(d=>{let p=s.associations.get(d);p!=null&&u.set(d,p)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let a=[],o=e.name?e.name:e.uuid,l=[];function c(p){p.morphTargetInfluences&&l.push(p.name?p.name:p.uuid)}Qs[r.path]===Qs.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(o);let h;switch(Qs[r.path]){case Qs.weights:h=hs;break;case Qs.rotation:h=us;break;case Qs.translation:case Qs.scale:h=qs;break;default:n.itemSize===1?h=hs:h=qs;break}let u=s.interpolation!==void 0?ww[s.interpolation]:yr,d=this._getArrayFromAccessor(n);for(let p=0,g=l.length;p<g;p++){let _=new h(l[p]+"."+Qs[r.path],t.array,d,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),a.push(_)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=ip(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof us?tp:eu;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Iw(i,e,t){let n=e.attributes,s=new qn;if(n.POSITION!==void 0){let o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(s.set(new C(l[0],l[1],l[2]),new C(c[0],c[1],c[2])),o.normalized){let h=ip($a[o.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let o=new C,l=new C;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],p=d.min,g=d.max;if(p!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(p[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(p[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(p[2]),Math.abs(g[2]))),d.normalized){let _=ip($a[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;let a=new xn;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function G0(i,e,t){let n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){i.setAttribute(o,l)})}for(let a in n){let o=np[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){let a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return at.workingColorSpace!==Pn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${at.workingColorSpace}" not supported.`),Wi(i,e),Iw(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?Ew(i,e.targets,t):i})}var W0=(function(){var i="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuixkbeeeddddillviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WboY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbrl79IV9Rbwq:VZkdbk:XYi5ud9:du8Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaicefhxcj;abad9Uc;WFbGcjdadca0EhmaialfgPar9Rgoadfhsavaoadz:jjjjbgzceVhHcbhOdndninaeaO9nmeaPax9RaD6mdamaeaO9RaOamfgoae6EgAcsfglc9WGhCabaOad2fhXaAcethQaxaDfhiaOaeaoaeao6E9RhLalcl4cifcd4hKazcj;cbfaAfhYcbh8AazcjdfhEaHh3incbh5dnawTmbaxa8Acd4fRbbh5kcbh8Eazcj;cbfhqinaih8Fdndndndna5a8Ecet4ciGgoc9:fPdebdkaPa8F9RaA6mrazcj;cbfa8EaA2fa8FaAz:jjjjb8Aa8FaAfhixdkazcj;cbfa8EaA2fcbaAz:kjjjb8Aa8FhixekaPa8F9RaK6mva8FaKfhidnaCTmbaPai9RcK6mbaocdtc:q:G:cjbfcj:G:cjbawEhaczhrcbhlinargoc9Wfghaqfhrdndndndndndnaaa8Fahco4fRbbalcoG4ciGcdtfydbPDbedvivvvlvkar9cb83bwar9cb83bbxlkarcbaiRbdai8Xbb9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbaqaofgrcGfcbaicdfa8J9c8N1:NfghRbbag9cjjjjjw:dg8J9qE86bbarcVfcbaha8J9c8M1:NfghRbbag9cjjjjjl:dg8J9qE86bbarc7fcbaha8J9c8L1:NfghRbbag9cjjjjjd:dg8J9qE86bbarctfcbaha8J9c8K1:NfghRbbag9cjjjjje:dg8J9qE86bbarc91fcbaha8J9c8J1:NfghRbbag9cjjjj;ab:dg8J9qE86bbarc4fcbaha8J9cg1:NfghRbbag9cjjjja:dg8J9qE86bbarc93fcbaha8J9ch1:NfghRbbag9cjjjjz:dgg9qE86bbarc94fcbahag9ca1:NfghRbbai8Xbe9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbarc95fcbaha8J9c8N1:NfgiRbbag9cjjjjjw:dg8J9qE86bbarc96fcbaia8J9c8M1:NfgiRbbag9cjjjjjl:dg8J9qE86bbarc97fcbaia8J9c8L1:NfgiRbbag9cjjjjjd:dg8J9qE86bbarc98fcbaia8J9c8K1:NfgiRbbag9cjjjjje:dg8J9qE86bbarc99fcbaia8J9c8J1:NfgiRbbag9cjjjj;ab:dg8J9qE86bbarc9:fcbaia8J9cg1:NfgiRbbag9cjjjja:dg8J9qE86bbarcufcbaia8J9ch1:NfgiRbbag9cjjjjz:dgg9qE86bbaiag9ca1:NfhixikaraiRblaiRbbghco4g8Ka8KciSg8KE86bbaqaofgrcGfaiclfa8Kfg8KRbbahcl4ciGg8La8LciSg8LE86bbarcVfa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc7fa8Ka8Lfg8KRbbahciGghahciSghE86bbarctfa8Kahfg8KRbbaiRbeghco4g8La8LciSg8LE86bbarc91fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc4fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc93fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc94fa8Kahfg8KRbbaiRbdghco4g8La8LciSg8LE86bbarc95fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc96fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc97fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc98fa8KahfghRbbaiRbigico4g8Ka8KciSg8KE86bbarc99faha8KfghRbbaicl4ciGg8Ka8KciSg8KE86bbarc9:faha8KfghRbbaicd4ciGg8Ka8KciSg8KE86bbarcufaha8KfgrRbbaiciGgiaiciSgiE86bbaraifhixdkaraiRbwaiRbbghcl4g8Ka8KcsSg8KE86bbaqaofgrcGfaicwfa8Kfg8KRbbahcsGghahcsSghE86bbarcVfa8KahfghRbbaiRbeg8Kcl4g8La8LcsSg8LE86bbarc7faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarctfaha8KfghRbbaiRbdg8Kcl4g8La8LcsSg8LE86bbarc91faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc4faha8KfghRbbaiRbig8Kcl4g8La8LcsSg8LE86bbarc93faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc94faha8KfghRbbaiRblg8Kcl4g8La8LcsSg8LE86bbarc95faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc96faha8KfghRbbaiRbvg8Kcl4g8La8LcsSg8LE86bbarc97faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc98faha8KfghRbbaiRbog8Kcl4g8La8LcsSg8LE86bbarc99faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc9:faha8KfghRbbaiRbrgicl4g8Ka8KcsSg8KE86bbarcufaha8KfgrRbbaicsGgiaicsSgiE86bbaraifhixekarai8Pbw83bwarai8Pbb83bbaiczfhikdnaoaC9pmbalcdfhlaoczfhraPai9RcL0mekkaoaC6moaimexokaCmva8FTmvkaqaAfhqa8Ecefg8Ecl9hmbkdndndndnawTmbasa8Acd4fRbbgociGPlbedrbkaATmdaza8Afh8Fazcj;cbfhhcbh8EaEhaina8FRbbhraahocbhlinaoahalfRbbgqce4cbaqceG9R7arfgr86bbaoadfhoaAalcefgl9hmbkaacefhaa8Fcefh8FahaAfhha8Ecefg8Ecl9hmbxikkaATmeaza8Afhaazcj;cbfhhcbhoceh8EaYh8FinaEaofhlaa8Vbbhrcbhoinala8FaofRbbcwtahaofRbbgqVc;:FiGce4cbaqceG9R7arfgr87bbaladfhlaLaocefgofmbka8FaQfh8FcdhoaacdfhaahaQfhha8EceGhlcbh8EalmbxdkkaATmbaocl4h8Eaza8AfRbbhqcwhoa3hlinalRbbaotaqVhqalcefhlaocwfgoca9hmbkcbhhaEh8FaYhainazcj;cbfahfRbbhrcwhoaahlinalRbbaotarVhralaAfhlaocwfgoca9hmbkara8E94aq7hqcbhoa8Fhlinalaqao486bbalcefhlaocwfgoca9hmbka8Fadfh8FaacefhaahcefghaA9hmbkkaEclfhEa3clfh3a8Aclfg8Aad6mbkaXazcjdfaAad2z:jjjjb8AazazcjdfaAcufad2fadz:jjjjb8AaAaOfhOaihxaimbkc9:hoxdkcbc99aPax9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaok:ysezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:kjjjb8Aav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk:4ioiue99dud99dud99dnaeTmbcbhiabhlindndnal8Uebgv:YgoJ:ji:1Salcof8UebgrciVgw:Y:vgDNJbbbZJbbb:;avcu9kEMgq:lJbbb9p9DTmbaq:Ohkxekcjjjj94hkkalclf8Uebhvalcdf8UebhxalarcefciGcetfak87ebdndnax:YgqaDNJbbbZJbbb:;axcu9kEMgm:lJbbb9p9DTmbam:Ohxxekcjjjj94hxkabaiarciGgkfcd7cetfax87ebdndnav:YgmaDNJbbbZJbbb:;avcu9kEMgP:lJbbb9p9DTmbaP:Ohvxekcjjjj94hvkalarcufciGcetfav87ebdndnawaw2:ZgPaPMaoaoN:taqaqN:tamamN:tgoJbbbbaoJbbbb9GE:raDNJbbbZMgD:lJbbb9p9DTmbaD:Ohrxekcjjjj94hrkalakcetfar87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk:Tvirud99eudndnadcl9hmbaeTmeindndnabRbbgiabcefgl8Sbbgvabcdfgo8Sbbgrf9R:YJbbuJabcifgwRbbgdce4adVgDcd4aDVgDcl4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax86bbdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao86bbdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai86bbdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad86bbabclfhbaecufgembxdkkaeTmbindndnab8Vebgiabcdfgl8Uebgvabclfgo8Uebgrf9R:YJbFu9habcofgw8Vebgdce4adVgDcd4aDVgDcl4aDVgDcw4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax87ebdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao87ebdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai87ebdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad87ebabcwfhbaecufgembkkk9teiucbcbyd:K:G:cjbgeabcifc98GfgbBd:K:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkk83dbcj:Gdk8Kbbbbdbbblbbbwbbbbbbbebbbdbbblbbbwbbbbc:K:Gdkl8W:qbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuixkbbebeeddddilve9Weeeviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WbwY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbDl79IV9Rbqq:W9Dklbzik94evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaeai86b:q:W:cjbaecitab8Piw83i:q:G:cjbaecefgecjd9hmbkk:JBl8Aud97dur978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaialfgxar9RhodnadTgmmbavaoad;8qbbkaicefhPcj;abad9Uc;WFbGcjdadca0EhsdndndnadTmbaoadfhzcbhHinaeaH9nmdaxaP9RaD6miabaHad2fhOaPaDfhAasaeaH9RaHasfae6EgCcsfgocl4cifcd4hXavcj;cbfaoc9WGgQcetfhLavcj;cbfaQci2fhKavcj;cbfaQfhYcbh8Aaoc;ab6hEincbh3dnawTmbaPa8Acd4fRbbh3kcbh5avcj;cbfh8Eindndndndna3a5cet4ciGgoc9:fPdebdkaxaA9RaQ6mwdnaQTmbavcj;cbfa5aQ2faAaQ;8qbbkaAaCfhAxdkaQTmeavcj;cbfa5aQ2fcbaQ;8kbxekaxaA9RaX6moaoclVcbawEhraAaXfhocbhidnaEmbaxao9Rc;Gb6mbcbhlina8EalfhidndndndndndnaAalco4fRbbgqciGarfPDbedibledibkaipxbbbbbbbbbbbbbbbbpklbxlkaiaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiaopbbbpklbaoczfhoxekaiaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcd4ciGarfPDbedibledibkaiczfpxbbbbbbbbbbbbbbbbpklbxlkaiczfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiczfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiczfaopbbbpklbaoczfhoxekaiczfaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcl4ciGarfPDbedibledibkaicafpxbbbbbbbbbbbbbbbbpklbxlkaicafaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaicafaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaicafaopbbbpklbaoczfhoxekaicafaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqco4arfPDbedibledibkaic8Wfpxbbbbbbbbbbbbbbbbpklbxlkaic8Wfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaoclffaqRb:q:W:cjbfhoxikaic8Wfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaocwffaqRb:q:W:cjbfhoxdkaic8Wfaopbbbpklbaoczfhoxekaic8WfaopbbdaoRbbgicitpbi:q:G:cjbaiRb:q:W:cjbgipsaoRbegqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbaiaocdffaqRb:q:W:cjbfhokalc;abfhialcjefaQ0meaihlaxao9Rc;Fb0mbkkdnaiaQ9pmbaici4hlinaxao9RcK6mwa8EaifhqdndndndndndnaAaico4fRbbalcoG4ciGarfPDbedibledibkaqpxbbbbbbbbbbbbbbbbpkbbxlkaqaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaoclffagRb:q:W:cjbfhoxikaqaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaocwffagRb:q:W:cjbfhoxdkaqaopbbbpkbbaoczfhoxekaqaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpkbbahaocdffagRb:q:W:cjbfhokalcdfhlaiczfgiaQ6mbkkaohAaoTmoka8EaQfh8Ea5cefg5cl9hmbkdndndndnawTmbaza8Acd4fRbbglciGPlbedwbkaQTmdavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep9Ta8Fpxeeeeeeeeeeeeeeeegap9op9Hp9rg8Fa8Jp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ugap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp9Ugap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp9Ugap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9AbbbaladfhlaoczfgoaQ6mbxikkaQTmeavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep:nea8Fpxebebebebebebebebgap9op:bep9rg8Fa8Jp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oegap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp:oegap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp:oegap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9AbbbaladfhlaoczfgoaQ6mbxdkkaQTmbcbhocbalcl4gl9Rc8FGhiavcjdfa8Afhrava8Afpbdbhainaravcj;cbfaofpblbg8JaYaofpblbg8KpmbzeHdOiAlCvXoQrLg8LaLaofpblbg8MaKaofpblbg8NpmbzeHdOiAlCvXoQrLgypmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Faap9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8LaypmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwKDYq8AkEx3m5P8Es8Fg8Ja8Ma8NpmwKDYq8AkEx3m5P8Es8Fg8KpmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9AbbbaradfhraoczfgoaQ6mbkka8Aclfg8Aad6mbkdnaCad2goTmbaOavcjdfao;8qbbkdnammbavavcjdfaCcufad2fad;8qbbkaCaHfhHc9:hoaAhPaAmbxlkkaeTmbaDalfhrcbhocuhlinaralaD9RglfaD6mdasaeao9Raoasfae6Eaofgoae6mbkaial9RhPkcbc99axaP9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaokwbz:bjjjbkNsezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk;Toio97eue97aec98Ghedndnadcl9hmbaeTmecbhdinababpbbbgicKp:RecKp:Sep;6eglaicwp:RecKp:Sep;6ealp;Geaiczp:RecKp:Sep;6egvp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgwp9op9rp;Keglpxbb;:9cbb;:9cbb;:9cbb;:9calalp;Meaoaop;Meavaravawp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFbbbFbbbFbbbFbbbp9oaipxbbbFbbbFbbbFbbbFp9op9qalavp;Mearp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaoavp;Mearp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgDaDpbbbgipxbbbbbbFFbbbbbbFFgwp9oabpbbbgoaipmbediwDqkzHOAKY8AEgvczp:Reczp:Sep;6eglaoaipmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eavczp:Sep;6egvp;Gealp;Gep;Kep;Legipxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgqp9op9rp;Keglpxb;:FSb;:FSb;:FSb;:FSalalp;Meaiaip;Meavaravaqp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbp9oaiavp;Mearp;Keczp:Rep9qgialavp;Mearp;KepxFFbbFFbbFFbbFFbbp9oglpmwDKYqk8AExm35Ps8E8Fp9qpkbbabaoawp9oaialpmbezHdiOAlvCXorQLp9qpkbbabcafhbadclfgdae6mbkkk;2ileue97euo97dnaec98GgiTmbcbheinabcKfpx:ji:1S:ji:1S:ji:1S:ji:1SabpbbbglabczfgvpbbbgopmlvorxmPsCXQL358E8Fgrczp:Segwpxibbbibbbibbbibbbp9qp;6egDp;NegqaDaDp;MegDaDp;KealaopmbediwDqkzHOAKY8AEgDczp:Reczp:Sep;6eglalp;MeaDczp:Sep;6egoaop;Mearczp:Reczp:Sep;6egrarp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jep;Mepxbbn0bbn0bbn0bbn0gDp;KepxFFbbFFbbFFbbFFbbgkp9oaqaop;MeaDp;Keczp:Rep9qgoaqalp;MeaDp;Keakp9oaqarp;MeaDp;Keczp:Rep9qgDpmwDKYqk8AExm35Ps8E8Fglp5eawclp:RegqpEi:T:j83ibavalp5baqpEd:T:j83ibabcwfaoaDpmbezHdiOAlvCXorQLgDp5eaqpEe:T:j83ibabaDp5baqpEb:T:j83ibabcafhbaeclfgeai6mbkkkuee97dnadcd4ae2c98GgeTmbcbhdinababpbbbgicwp:Recwp:Sep;6eaicep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbabczfhbadclfgdae6mbkkk:Sodw97euaec98Ghedndnadcl9hmbaeTmecbhdinabpxbbuJbbuJbbuJbbuJabpbbbgicKp:TeglaicYp:Tep9qgvcdp:Teavp9qgvclp:Teavp9qgop;6ep;Negvaicwp:RecKp:SegraipxFbbbFbbbFbbbFbbbgwp9ogDp:Uep;6ep;Mepxbbn0bbn0bbn0bbn0gqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9oavaDarp:Xeaiczp:RecKp:Segip:Uep;6ep;Meaqp;Keawp9op9qavaDaraip:Uep:Xep;6ep;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qavaoalcep:Rep9oalpxebbbebbbebbbebbbp9op9qp;6ep;Meaqp;KecKp:Rep9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgkpxbFu9hbFu9hbFu9hbFu9habpbbbglakpbbbgrpmlvorxmPsCXQL358E8Fgvczp:TegqavcHp:Tep9qgicdp:Teaip9qgiclp:Teaip9qgicwp:Teaip9qgop;6ep;NegialarpmbediwDqkzHOAKY8AEgDpxFFbbFFbbFFbbFFbbglp9ograDczp:Segwp:Ueavczp:Reczp:SegDp:Xep;6ep;Mepxbbn0bbn0bbn0bbn0gvp;Kealp9oaiarawaDp:Uep:Xep;6ep;Meavp;Keczp:Rep9qgwaiaoaqcep:Rep9oaqpxebbbebbbebbbebbbp9op9qp;6ep;Meavp;Keczp:ReaiaDarp:Uep;6ep;Meavp;Kealp9op9qgipmwDKYqk8AExm35Ps8E8FpkbbabawaipmbezHdiOAlvCXorQLpkbbabcafhbadclfgdae6mbkkk9teiucbcbydj:G:cjbgeabcifc98GfgbBdj:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkxebcj:Gdklz:zbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var s=WebAssembly.validate(t)?o(e):o(i),r,a=WebAssembly.instantiate(s,{}).then(function(m){r=m.instance,r.exports.__wasm_call_ctors()});function o(m){for(var x=new Uint8Array(m.length),S=0;S<m.length;++S){var y=m.charCodeAt(S);x[S]=y>96?y-97:y>64?y-39:y+4}for(var R=0,S=0;S<m.length;++S)x[R++]=x[S]<60?n[x[S]]:(x[S]-60)*64+x[++S];return x.buffer.slice(0,R)}function l(m,x,S,y,R,M,b){var w=m.exports.sbrk,L=y+3&-4,I=w(L*R),N=w(M.length),k=new Uint8Array(m.exports.memory.buffer);k.set(M,N);var V=x(I,y,R,N,M.length);if(V==0&&b&&b(I,L,R),S.set(k.subarray(I,I+y*R)),w(I-w(0)),V!=0)throw new Error("Malformed buffer data: "+V)}var c={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp",COLOR:"meshopt_decodeFilterColor"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},u=[],d=0;function p(m){var x={object:new Worker(m),pending:0,requests:{}};return x.object.onmessage=function(S){var y=S.data;x.pending-=y.count,x.requests[y.id][y.action](y.value),delete x.requests[y.id]},x}function g(m){for(var x="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(s)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+v.name+";"+l.toString()+v.toString(),S=new Blob([x],{type:"text/javascript"}),y=URL.createObjectURL(S),R=u.length;R<m;++R)u[R]=p(y);for(var R=m;R<u.length;++R)u[R].object.postMessage({});u.length=m,URL.revokeObjectURL(y)}function _(m,x,S,y,R){for(var M=u[0],b=1;b<u.length;++b)u[b].pending<M.pending&&(M=u[b]);return new Promise(function(w,L){var I=new Uint8Array(S),N=++d;M.pending+=m,M.requests[N]={resolve:w,reject:L},M.object.postMessage({id:N,count:m,size:x,source:I,mode:y,filter:R},[I.buffer])})}function v(m){var x=m.data;self.ready.then(function(S){if(!x.id)return self.close();try{var y=new Uint8Array(x.count*x.size);l(S,S.exports[x.mode],y,x.count,x.size,x.source,S.exports[x.filter]),self.postMessage({id:x.id,count:x.count,action:"resolve",value:y},[y.buffer])}catch(R){self.postMessage({id:x.id,count:x.count,action:"reject",value:R})}})}return{ready:a,supported:!0,useWorkers:function(m){g(m)},decodeVertexBuffer:function(m,x,S,y,R){l(r,r.exports.meshopt_decodeVertexBuffer,m,x,S,y,r.exports[c[R]])},decodeIndexBuffer:function(m,x,S,y){l(r,r.exports.meshopt_decodeIndexBuffer,m,x,S,y)},decodeIndexSequence:function(m,x,S,y){l(r,r.exports.meshopt_decodeIndexSequence,m,x,S,y)},decodeGltfBuffer:function(m,x,S,y,R,M){l(r,r.exports[h[R]],m,x,S,y,r.exports[c[M]])},decodeGltfBufferAsync:function(m,x,S,y,R){return u.length>0?_(m,x,S,h[y],c[R]):a.then(function(){var M=new Uint8Array(m*x);return l(r,r.exports[h[y]],M,m,x,S,r.exports[c[R]]),M})}}})();var rp=new Map,Lw=/^(light_|screen|flame|window_glow)/,q0=/^(light_|screen|flame|window_glow|glass_clear|solar_cell|void)/,Ms=null;function X0(){return Ms||(Ms=new Xn({vertexColors:!0,metalness:1,roughness:1}),Ms.name="plain",Ms.envMapIntensity=1.15,Ms.userData.modelMaterial=!0,Ms.onBeforeCompile=i=>{i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
attribute vec2 aPbr;
varying vec2 vPbr;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vPbr = aPbr;`),i.fragmentShader=i.fragmentShader.replace("#include <common>",`#include <common>
varying vec2 vPbr;`).replace("#include <roughnessmap_fragment>","float roughnessFactor = clamp(vPbr.x, 0.05, 1.0);").replace("#include <metalnessmap_fragment>","float metalnessFactor = clamp(vPbr.y, 0.0, 1.0);")},Ms.customProgramCacheKey=()=>"plain-pbr",Ms)}function j0(i,e,t,n){let s=new Lt,r=i.attributes.position,a=i.attributes.normal,o=i.attributes.color,l=new Float32Array(r.count*3),c=new Float32Array(r.count*3),h=new Float32Array(r.count*3);for(let d=0;d<r.count;d++){l[d*3]=r.getX(d),l[d*3+1]=r.getY(d),l[d*3+2]=r.getZ(d),a&&(c[d*3]=a.getX(d),c[d*3+1]=a.getY(d),c[d*3+2]=a.getZ(d));let p=o?o.getX(d):1;h[d*3]=(e?e.r:1)*p,h[d*3+1]=(e?e.g:1)*(o?o.getY(d):1),h[d*3+2]=(e?e.b:1)*(o?o.getZ(d):1)}s.setAttribute("position",new ut(l,3)),s.setAttribute("normal",new ut(c,3)),s.setAttribute("color",new ut(h,3));let u=new Float32Array(r.count*2);for(let d=0;d<r.count;d++)u[d*2]=t,u[d*2+1]=n;return s.setAttribute("aPbr",new ut(u,2)),i.index&&s.setIndex(new ut(Uint32Array.from(i.index.array),1)),s}function Dw(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(s=>{if(!s.isMesh||s.isSkinnedMesh||Array.isArray(s.material))return;let r=s.parent;for(;r&&r!==i&&!(r.userData&&r.userData.part);)r=r.parent;r=r||i;let a=s.material,o=q0.test(a.name||"")||a.transparent||a.map,l=o?a:X0();e.has(r)||e.set(r,new Map);let c=e.get(r);c.has(l)||c.set(l,[]),c.get(l).push({mesh:s,bake:!o})});let t=new qe,n=new qe;for(let[s,r]of e){t.copy(s.matrixWorld).invert();for(let[a,o]of r){let l=o.map(({mesh:u,bake:d})=>{let p=j0(u.geometry,d?u.material.color:null,u.material.roughness,u.material.metalness);return p.applyMatrix4(n.multiplyMatrices(t,u.matrixWorld)),p}),c=l.length===1?l[0]:Rf(l,!1);if(!c)continue;c.computeBoundingSphere(),o[0].bake||(a.vertexColors=!0,a.needsUpdate=!0,c.deleteAttribute("aPbr"));let h=new Et(c,a);h.name=(s.name||"model")+":"+(a.name||"m");for(let{mesh:u}of o)u.parent.remove(u),u.geometry.dispose();s.add(h)}}}function Fw(i){let e=[];i.traverse(o=>{o.isSkinnedMesh&&!Array.isArray(o.material)&&e.push(o)});let t=e.filter(o=>!(q0.test(o.material.name||"")||o.material.transparent||o.material.map));if(t.length<2)return;let n=t[0];if(!t.every(o=>o.parent===n.parent&&o.skeleton.bones.length===n.skeleton.bones.length))return;let s=t.map(o=>{let l=j0(o.geometry,o.material.color,o.material.roughness,o.material.metalness),c=o.geometry.attributes.skinIndex,h=o.geometry.attributes.skinWeight,u=new Uint16Array(c.count*4),d=new Float32Array(c.count*4);for(let p=0;p<c.count;p++)u[p*4]=c.getX(p),u[p*4+1]=c.getY(p),u[p*4+2]=c.getZ(p),u[p*4+3]=c.getW(p),d[p*4]=h.getX(p),d[p*4+1]=h.getY(p),d[p*4+2]=h.getZ(p),d[p*4+3]=h.getW(p);return l.setAttribute("skinIndex",new ut(u,4)),l.setAttribute("skinWeight",new ut(d,4)),l}),r=Rf(s,!1);if(!r)return;let a=new Mr(r,X0());a.name="body",a.frustumCulled=!1,n.parent.add(a),a.bind(n.skeleton,n.bindMatrix);for(let o of t)o.parent.remove(o),o.geometry.dispose()}function Nw(i){let e=!1;i.scene.traverse(n=>{n.isSkinnedMesh&&(e=!0)}),e?Fw(i.scene):Dw(i.scene);let t=new Set;return i.scene.traverse(n=>{if(n.isSkinnedMesh&&(e=!0,n.frustumCulled=!1),!n.isMesh)return;n.castShadow=!0,n.receiveShadow=!0;let s=Array.isArray(n.material)?n.material:[n.material];for(let r of s){if(t.has(r))continue;t.add(r);let a=r.name||"";a.startsWith("glass_clear")?(r.transparent=!0,r.depthWrite=!1,r.opacity=.28,r.roughness=.06,r.metalness=0,r.envMapIntensity=1.6,r.side=yn,n.castShadow=!1):Lw.test(a)?(r.toneMapped=!0,r.userData.baseEmissive=r.emissiveIntensity||1,n.castShadow=!1):a==="void"&&(r.color.set(0),r.roughness=1),r.metalness>.5&&(r.envMapIntensity=1.25),r.userData.modelMaterial=!0}}),{scene:i.scene,animations:i.animations||[],skinned:e}}async function K0(i,e){let t=new Zh;t.setMeshoptDecoder(W0);let n=0,s=[];return await Promise.all(i.map(async r=>{if(!rp.has(r)){let a=await t.loadAsync($s(`assets/models/${r}.glb`));rp.set(r,Nw(a))}s.push(r),n++,e&&e(n/i.length)})),s}function Zn(i,e={}){let t=rp.get(i);if(!t)throw new Error(`Model not loaded: ${i}`);let n=t.skinned?$h(t.scene):t.scene.clone(!0);e.face&&(n.rotation.y=Math.PI);let s=new qt;return s.name=i,s.add(n),{root:s,part:a=>n.getObjectByName(a),clips:t.animations,inner:n}}function ws(i,e){let t=[];if(!i)return t;let n=s=>{if(e&&!e.test(s.name||""))return s;let r=s.clone();return r.userData={...s.userData},t.push(r),r};return i.traverse(s=>{s.isMesh&&(s.material=Array.isArray(s.material)?s.material.map(n):n(s.material))}),t}function qi(i,e){for(let t of i)t.userData.baseEmissive!==void 0&&(t.emissiveIntensity=t.userData.baseEmissive*e)}function ap(i){let e=[];return i.inner.traverse(t=>{t.name&&t.name.startsWith("col_")&&t.userData&&t.userData.radius&&e.push({name:t.name,x:t.position.x,z:t.position.z,r:t.userData.radius,node:t})}),e}var er=[{name:"Tharsis Rise",lat:2,lon:247,r:2600,h:5.5,type:"bulge"},{name:"Olympus Mons",lat:18.65,lon:226.2,r:310,h:21.9,type:"volcano",cal:.09,note:"Tallest volcano in the solar system. The slopes are so gentle you could not see the summit from the base \u2014 the planet curves away first."},{name:"Ascraeus Mons",lat:11.92,lon:255.92,r:220,h:14.9,type:"volcano",cal:.1,note:'Northernmost of the Tharsis Montes. Its name means "rustic" \u2014 for a mountain twice the height of Everest.'},{name:"Pavonis Mons",lat:1.48,lon:247.04,r:190,h:8.4,type:"volcano",cal:.12,note:"Sits almost exactly on the equator. A space elevator dream site, if Mars ever files the permits."},{name:"Arsia Mons",lat:-8.35,lon:239.91,r:220,h:11.7,type:"volcano",cal:.16,note:"Has a caldera you could drop a small country into, and cave skylights along its flanks."},{name:"Alba Mons",lat:40.5,lon:250.4,r:600,h:6.8,type:"volcano",cal:.07,note:"The biggest volcano by area anywhere \u2014 a pancake 1000+ km across that you could drive over without noticing the summit."},{name:"Elysium Mons",lat:25.02,lon:147.21,r:210,h:14.1,type:"volcano",cal:.09,note:"The lonely giant of the eastern hemisphere, far from the Tharsis crowd."},{name:"Hecates Tholus",lat:32.12,lon:150.24,r:90,h:4.8,type:"volcano",cal:.12,note:"Small by Mars standards. Merely enormous by Earth standards."},{name:"Hellas Planitia",lat:-42.4,lon:70.5,r:1050,h:-7.2,type:"basin",note:"Deepest hole on Mars \u2014 the air at the bottom is thick enough that liquid water could briefly survive. Briefly."},{name:"Argyre Planitia",lat:-49.7,lon:316,r:450,h:-5.2,type:"basin",note:"An ancient impact scar ringed by mountains. Named for a mythical island of silver."},{name:"Isidis Planitia",lat:12.9,lon:87,r:380,h:-3.7,type:"basin",note:"Third-largest impact basin. Beagle 2 sleeps here, half-opened, like a stood-up date."},{name:"Utopia Planitia",lat:46.7,lon:117.5,r:830,h:-4.1,type:"basin",note:"Largest recognized impact basin in the solar system. Also where Starfleet will someday build ships, allegedly."},{name:"Gale Crater",lat:-5.4,lon:137.8,r:77,h:-3.8,type:"crater",peak:2.8,note:"Home of Mount Sharp and one very hardworking nuclear-powered robot geologist."},{name:"Jezero Crater",lat:18.44,lon:77.45,r:24,h:-2.5,type:"crater",note:"An ancient river delta. Perseverance is here, caching rocks and minding a helicopter."},{name:"Gusev Crater",lat:-14.57,lon:175.48,r:83,h:-1.9,type:"crater",note:"Spirit's home. She drove backwards for years, dragging a bad wheel, and found ancient hot springs doing it."},{name:"Schiaparelli Crater",lat:-2.71,lon:16.77,r:230,h:-2.2,type:"crater",note:'Named for the astronomer whose "canali" got mistranslated into canals and a century of Martian fever dreams.'},{name:"Huygens Crater",lat:-13.88,lon:55.58,r:234,h:-2.5,type:"crater",note:"The largest well-preserved crater on Mars, sitting on some of the oldest crust anywhere."},{name:"Cassini Crater",lat:23.82,lon:32.12,r:205,h:-1.8,type:"crater",note:"A vast, soft-shouldered ruin in Arabia Terra. Old enough to have forgotten its own impact."},{name:"Lyot Crater",lat:50.47,lon:29.32,r:110,h:-3,type:"crater",note:"The deepest point in the northern hemisphere. Bring a flashlight and a coat."},{name:"Korolev Crater",lat:72.77,lon:164.58,r:41,h:-2,type:"crater",ice:!0,note:"Permanently full of water ice, 1800 cubic kilometers of it \u2014 a frozen lake the size of a small sea."},{name:"Noctis Labyrinthus",lat:-6.9,lon:261,r:120,h:-4.5,type:"canyon",to:{lat:-8,lon:267},note:"The Labyrinth of Night: a shattered maze of canyons where Valles Marineris begins."},{name:"Ius Chasma",lat:-7.5,lon:269,r:55,h:-6.5,type:"canyon",to:{lat:-9,lon:279},note:"Twin parallel troughs carved deeper than four Grand Canyons stacked."},{name:"Melas Chasma",lat:-10,lon:283,r:90,h:-7,type:"canyon",to:{lat:-11,lon:290},note:"The widest heart of Valles Marineris. The canyon floor has its own weather."},{name:"Coprates Chasma",lat:-12.5,lon:293,r:60,h:-6.8,type:"canyon",to:{lat:-14,lon:304},note:"Nearly 1000 km of unbroken chasm. The walls rise 8 km \u2014 you cannot see the top from the floor."},{name:"Eos Chasma",lat:-13,lon:307,r:70,h:-5.2,type:"canyon",to:{lat:-10,lon:315},note:"Where the great canyon exhales into chaos terrain and ancient flood channels."},{name:"Capri Chasma",lat:-8.5,lon:313,r:60,h:-4.2,type:"canyon",to:{lat:-4,lon:318},note:"The canyon's outlet ramp, spilling toward the lowlands that once may have held a sea."},{name:"Planum Boreum",lat:90,lon:0,r:600,h:2.2,type:"cap",note:"The northern ice cap: water ice, spiral troughs, and winter air that freezes out of the sky."},{name:"Planum Australe",lat:-90,lon:0,r:500,h:3,type:"cap",note:"The southern cap, taller and colder. Radar hints at buried brine lakes beneath."},{name:"Syrtis Major",lat:8.4,lon:69.5,r:600,h:1,type:"albedo",note:"The dark patch telescopes have watched since 1659 \u2014 the oldest continuously observed feature on any other planet."}],tu=[{name:"Acidalia Planitia",lat:49.8,lon:339.3,r:27},{name:"Chryse Planitia",lat:28.4,lon:319.7,r:18},{name:"Amazonis Planitia",lat:24.8,lon:196,r:20},{name:"Arcadia Planitia",lat:47.2,lon:184.3,r:19},{name:"Elysium Planitia",lat:3,lon:154.7,r:18},{name:"Arabia Terra",lat:22.8,lon:5,r:26},{name:"Terra Sabaea",lat:-2,lon:42,r:22},{name:"Noachis Terra",lat:-45,lon:350,r:25},{name:"Terra Sirenum",lat:-39.7,lon:205.8,r:24},{name:"Terra Cimmeria",lat:-34.7,lon:145,r:24},{name:"Tempe Terra",lat:39.3,lon:289,r:16},{name:"Meridiani Planum",lat:-.2,lon:356.8,r:10},{name:"Vastitas Borealis",lat:68,lon:90,r:35},{name:"Ares Vallis",lat:16.5,lon:327.5,r:8}],nu=[{name:"Mars 3",lat:-45,lon:202,year:1971,scrap:2,note:"The first soft landing on Mars. It transmitted for 110 seconds, sent half a gray picture, and went silent forever. A poet."},{name:"Mars 6",lat:-23.9,lon:340.6,year:1974,scrap:2,note:"Transmitted all the way down and stopped at the surface. Its data described the air it died in."},{name:"Viking 1",lat:22.48,lon:312.05,year:1976,scrap:3,note:"First American on Mars. Worked for six years. Its biology experiments are still being argued about at conferences."},{name:"Viking 2",lat:47.97,lon:134.26,year:1976,scrap:3,note:"Landed on a rock and spent six years slightly tilted. Photographed frost. Never complained."},{name:"Pathfinder",lat:19.13,lon:326.79,year:1997,scrap:0,note:"The little lander that could \u2014 and its rover Sojourner, the size of a microwave, the courage of a battleship."},{name:"Beagle 2",lat:11.53,lon:90.43,year:2003,scrap:2,note:"Landed successfully, then two solar panels failed to open, hiding its antenna. Found 12 years later, almost fine. ALMOST."},{name:"Spirit",lat:-14.57,lon:175.47,year:2004,scrap:3,note:"Ninety-day mission; drove six years. Finally stuck in soft sand \u2014 which its dragging wheel had just revealed to be ancient hot-spring silica."},{name:"Opportunity",lat:-1.95,lon:354.47,year:2004,scrap:3,note:`Ninety-day mission; drove a marathon over 14 years. Last words, roughly: "My battery is low and it's getting dark."`},{name:"Phoenix",lat:68.22,lon:234.25,year:2008,scrap:3,note:"Dug up polar ice with a robot arm and watched snow fall on Mars. The Martian winter buried it in dry ice. Worth it."},{name:"Curiosity",lat:-4.59,lon:137.44,year:2012,scrap:2,note:'Nuclear-powered, laser-armed, sky-crane-delivered. Sang itself "Happy Birthday" alone in Gale Crater once. Once.'},{name:"Schiaparelli EDM",lat:-2.05,lon:353.79,year:2016,scrap:3,note:"A software hiccup convinced it the ground was above it. The crater it made is very geographically informative."},{name:"InSight",lat:4.5,lon:135.62,year:2018,scrap:3,note:"Listened to the heartbeat of Mars: over 1300 marsquakes. Its last selfie shows it covered in the dust that retired it."},{name:"Perseverance",lat:18.44,lon:77.45,year:2021,scrap:2,note:"Carries 43 sample tubes and brought a helicopter as carry-on. Ingenuity flew 72 times when it was rated for 5."},{name:"Zhurong",lat:25.07,lon:109.93,year:2021,scrap:2,note:"China's first Mars rover, named for a fire god, parked in Utopia. Hibernated for winter; the dust decided it should keep hibernating."}];for(let i of er)i.v=kt(i.lat,i.lon),i.angR=i.r/3389.5;for(let i of tu)i.v=kt(i.lat,i.lon),i.angR=i.r*bs;for(let i of nu)i.v=kt(i.lat,i.lon);function iu(i){let e=null,t=1e9;for(let s of[tu,er])for(let r of s){if(r.type==="bulge"||r.type==="albedo")continue;Mn(i.x,i.y,i.z,r.v.x,r.v.y,r.v.z)<r.angR&&r.angR<t&&(t=r.angR,e=r.name)}if(e)return e;let n=Jn(i);return n.lat>55?"Vastitas Borealis":n.lat<-60?"Southern Highlands":F0(i.x,i.y,i.z)<-1.5?"Northern Lowlands":"Cratered Highlands"}var A={plots:[],panels:[],soilPiles:[],landers:[],iceSites:[],builtMeshes:[],markers:[],pods:[]},nr=[],lp=[];function Xi(i,e,t){let n=new qt;lp.push(n);let s=i.isVector3?wn.copy(i).normalize().clone():kt(i,e),r=At(s);return n.position.copy(s).multiplyScalar(r),Gi(s,t||0,n.quaternion),n.userData.up=s.clone(),ce.world.add(n),n}function op(i,e,t,n){let s=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position);nr.push({v:s.normalize().clone(),r:n})}var Qn=8.4,Ow=.06,Y0=.16;function J0(i){for(let e=0;e<200;e++){let t=(i()*2-1)*52,n=i()*360,s=kt(t,n);if(N0(s)>.28)continue;let r=kt(19.13,326.79),a=kt(-2.71,16.77);if(Mn(s.x,s.y,s.z,r.x,r.y,r.z)*12e3<2500||Mn(s.x,s.y,s.z,a.x,a.y,a.z)*12e3<2500)continue;let o=!1;for(let l of f.storm.cells||[]){let c=kt(l.lat,l.lon);if(Mn(s.x,s.y,s.z,c.x,c.y,c.z)*12e3<l.r+2500){o=!0;break}}if(!o)return{lat:t,lon:n,v:s}}return{lat:18,lon:340,v:kt(18,340)}}function $0(i){A.hab=Xi(i.lat,i.lon,0),A.hab.position.addScaledVector(A.hab.userData.up,-Ow);let e=Zn("hab");A.hab.add(e.root),A.habModel=e;for(let l of ap(e)){l.node.updateWorldMatrix(!0,!1);let c=l.node.getWorldPosition(new C),h=A.hab.worldToLocal(c);op(A.hab,h.x,h.z,l.r)}A.beaconMats=ws(e.part("beacon")),A.oxyMats=ws(e.part("status_oxy")),A.commsMats=ws(e.part("comms_screen")),A.hydFlame=e.part("hydrazine_flame"),A.breachHole=e.part("breach_hole"),A.breachPatch=e.part("breach_patch");for(let l of[A.hydFlame,A.breachHole,A.breachPatch])l&&(l.visible=!1);A.habInterior=e.part("interior"),A.habInterior&&A.habInterior.traverse(l=>{l.isMesh&&(l.castShadow=!1)}),A.hab.userData.reach=6e3,A.habFurnishings=new qt,A.hab.add(A.habFurnishings),A.doors=["door_outer_L","door_outer_R","door_inner_L","door_inner_R"].map(l=>{let c=e.part(l);return c?{node:c,x0:c.position.x,dx:c.userData.open_dx||(l.endsWith("_L")?-1.05:1.05),k:0,outer:l.includes("outer")}:null}).filter(Boolean),A.habLights=[];let t=ce.engine.q.scale<.7?["light_0","light_2"]:["light_0","light_1","light_2","light_3"];for(let l of t){let c=e.part(l);if(!c)continue;let h=new Pr(16770244,15,26,1.6);h.userData.on=15,c.add(h),A.habLights.push(h)}for(let l=0;l<6;l++){let c=-5.2+l%2*2,h=-3.2+Math.floor(l/2)*2.4;tv(A.hab,c,h,!0,A.habFurnishings)}let n=tr(A.hab,-30,4,0);for(let l=0;l<8;l++){let c=-Math.floor(l/4)*5.5,h=l%4*4.6,u=new qt;u.position.set(c,0,h),n.add(u);let d=Zn("solar_panel");u.add(d.root);let p=ws(d.part("panel")||d.root).filter(_=>_.name==="solar_cell"),g={mesh:d.part("panel")||d.root,cells:p,dust:.22+l*.05,group:u};op(n,c,h,1),A.panels.push(g)}A.solarGroup=n,Bw(tr(A.hab,15,15,2.6)),[[22,-8],[31,15],[-14,24],[8,27],[-24,-16],[16,-22]].forEach(([l,c],h)=>{let u=tr(A.hab,l,c,Yn(h,3,5)*6.28),d=gi(u,"regolith_pile");A.soilPiles.push({mesh:d.part("heap"),group:u,left:2,cols:[hp(u,0,0,.85)]})});let s=tr(A.hab,11.5,7.5,0);s.add(Zn("uplink_dish").root),A.uplink=s,nr.push({v:s.position.clone().normalize(),r:.8});let r=tr(A.hab,7,9.5,0),a=gi(r,"uplink_pad");A.padLampMats=ws(a.root,/^light_/),A.uplinkRing=r;for(let l=0;l<3;l++){let c=.7+l*.5,h=60+l*45,u=tr(A.hab,Math.sin(c)*h,Math.cos(c)*h,Ga()*6),d=gi(u,["debris_a","debris_b","debris_c"][l]);A.pods.push({group:u,kind:"debris",taken:!1,loot:{scrap:2},label:"Salvage MDV debris",cols:d.cols})}let o=tr(A.hab,-420,590,.6);A.rtgSite={group:o,taken:!1,cols:gi(o,"rtg").cols}}function Hr(i,e){i.userData.hidden=!e,i.visible=e&&i.userData.near!==!1}var kw=new C;function Z0(i){let e=i.length(),t=Math.sqrt(Math.max(0,e*e-11870*11870));for(let n of lp){if(n.parent!==ce.world)continue;let s=kw.copy(n.position).sub(i).length(),r=n.userData.reach||1800;n.userData.near=A.sealedInside?n===A.hab:s<Math.min(r,t+700),n.userData.hidden?n.visible=!1:n.userData.near!==n.visible&&(n.visible=n.userData.near)}}function Q0(i){if(!A.hab||!A.doors)return;let e=f.mode==="rover"?A.rover.group.position:A.playerPos||A.hab.position,t=Za(A.hab,e,wn),n=Math.hypot(t.x,t.z),s=Math.abs(t.x)<5&&t.z>0&&t.z<26,r=n<Qn+.5||s;A.habInterior&&(A.habInterior.visible=r),A.habFurnishings&&(A.habFurnishings.visible=r),A.sealedInside=f.mode==="walk"&&n<Qn-.3&&A.doors.every(a=>a.k<.01);for(let a of A.doors){let o=t.z-(a.outer?11.6:Qn),c=Math.abs(t.x)<2.6&&Math.abs(o)<3.4&&f.mode==="walk"?1:0;a.k+=Math.sign(c-a.k)*Math.min(Math.abs(c-a.k),i*2.2);let h=a.k*a.k*(3-2*a.k);a.node.position.x=a.x0+a.dx*h}}function ev(i){let e=ce.planet,t=(n,s,r)=>e.addPad(n.x,n.y,n.z,s,r);t(i.v,46,34),t(kt(19.13,326.79),7,10),t(kt(-1.9,15.9),16,18);for(let n of nu)n.name!=="Pathfinder"&&t(n.v,6,9);ce.terrain.syncPads(e.pads)}function tr(i,e,t,n){let r=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position).normalize().clone(),a=new qt;return lp.push(a),a.position.copy(r).multiplyScalar(At(r)),Gi(r,n||0,a.quaternion),a.userData.up=r.clone(),ce.world.add(a),a}function tv(i,e,t,n,s){let r=new qt;r.position.set(e,.06,t),(s||i).add(r);let a=Zn("farm_plot");r.add(a.root);let o=a.part("soil"),l=a.part("plants"),c=a.part("plants_dead");c&&(c.visible=!1),o.visible=!1,l.visible=!1,n&&op(i,e,t,.85);let h=new C(e,0,t).applyQuaternion(i.quaternion).add(i.position);return A.plots.push({group:r,soilMesh:o,plants:l,plantsDead:c,worldPos:h,state:"empty",crop:"potato",growth:0,watered:0}),A.plots[A.plots.length-1]}var cp=.62;function Bw(i){let e=Zn("rover",{face:!0});i.add(e.root);let t=["wheel_FL","wheel_ML","wheel_RL","wheel_FR","wheel_MR","wheel_RR"].map(h=>e.part(h)).filter(Boolean),n={FL:e.part("steer_FL"),FR:e.part("steer_FR"),RL:e.part("steer_RL"),RR:e.part("steer_RR")},s=new fs(16773848,0,110,.6,.55,1.5),r=e.part("headlight_L"),a=e.part("headlight_R"),o=new C(0,1.4,2.6);r&&a&&(e.inner.updateWorldMatrix(!0,!0),o.copy(r.getWorldPosition(new C)).add(a.getWorldPosition(new C)).multiplyScalar(.5),e.inner.worldToLocal(o)),s.position.copy(o);let l=new Tt;l.position.set(o.x,o.y-1.2,o.z+16),e.inner.add(s,l),s.target=l;let c=[];e.inner.traverse(h=>{h.isMesh&&!Array.isArray(h.material)&&/^light_(white|red|amber)/.test(h.material.name)&&(h.material=h.material.clone(),h.material.userData.baseEmissive=h.material.emissiveIntensity||1,c.push(h.material))}),A.rover={group:i,wheels:t,steer:n,headlight:s,lamps:c,speed:0,model:e,cargo:e.part("cargo"),seat:e.part("seat"),dish:e.part("dish")},A.roverCollider={v:i.position.clone().normalize(),r:2.6},nr.push(A.roverCollider)}var zw={"Mars 3":"mars3","Mars 6":"mars3","Viking 1":"viking","Viking 2":"viking","Beagle 2":"beagle2",Spirit:"mer",Opportunity:"mer",Phoenix:"phoenix",Curiosity:"msl",Perseverance:"msl","Schiaparelli EDM":"schiaparelli_wreck",InSight:"insight",Zhurong:"zhurong"},su=new C;function hp(i,e,t,n){let r={v:new C(e,0,t).applyQuaternion(i.quaternion).add(i.position).normalize(),r:n,r0:n};return nr.push(r),r}function ru(i,e){if(i)for(let t of i)t.r=e?t.r0:.001}function gi(i,e,t={}){let n=Zn(e);t.at&&n.root.position.set(t.at[0],0,t.at[1]),t.yaw&&(n.root.rotation.y=t.yaw),i.add(n.root),n.cols=[];for(let s of ap(n))s.node.updateWorldMatrix(!0,!1),i.worldToLocal(s.node.getWorldPosition(su)),n.cols.push(hp(i,su.x,su.z,s.r));return n}function nv(){let i=Xi(19.13,326.79,.7);A.pfModel=Zn("pathfinder"),i.add(A.pfModel.root),A.pathfinder=i,A.pfCollider={v:i.position.clone().normalize(),r:2},nr.push(A.pfCollider);let e=Xi(-1.9,15.9,0),t=Zn("mav");e.add(t.root),A.mavRocket=t.part("ascent"),A.mavRocketY=A.mavRocket.position.y,A.mavNose=t.part("nose"),A.mavStrobeMats=ws(t.part("strobe"));let n=t.part("flame"),s=new Et(new Do(.9,.2,7,14,1,!0),new dn({color:new Me(8,4.2,1.2),transparent:!0,opacity:.9,side:yn,depthWrite:!1,fog:!1}));s.position.y=-3.5,(n||A.mavRocket).add(s),s.visible=!1,A.mavFlame=s,A.mav=e,e.userData.reach=9e3,nr.push({v:e.position.clone().normalize(),r:3.4});for(let a of nu){if(a.name==="Pathfinder"){A.landers.push({data:a,group:i});continue}let o=Xi(a.lat,a.lon,Ga()*6);gi(o,zw[a.name]),a.name==="Perseverance"&&gi(o,"ingenuity",{at:[3.2,2.1],yaw:.7}),A.landers.push({data:a,group:o})}let r=[[72.77,164.58]];for(let a=0;a<11;a++)r.push([42+Yn(a,7,1)*32,Yn(a,3,9)*360]);for(let[a,o]of r){let l=Xi(a,o,Yn(a,o,4)*6.28),c=gi(l,"ice_outcrop"),h=[];for(let u=0;u<6;u++){let d=c.part("block_"+u);d&&h.push({node:d,col:hp(l,d.position.x,d.position.z,.6)})}A.iceSites.push({group:l,left:6,korolev:a>70,blocks:h})}}function ul(i,e,t){let n=gi(i,"supply_pod"),s={group:i,kind:"pod",taken:!1,loot:e,label:t,cols:n.cols,lid:n.part("lid"),strobe:ws(n.part("strobe"),/^light_/)};return A.pods.push(s),s}var ir={wall:3.93,doorHalf:.75,portalOuter:.86,portalEnd:4.62,floor:.06};function au(i,e,t=0){if(i==="greenhouse"){let r=su.copy(e).normalize(),a=ce.planet.addPad(r.x,r.y,r.z,5.6,5);ce.terrain.syncPads([a])}let n=Xi(e,void 0,t),s={kind:i,group:n,v:n.position.clone().normalize(),yaw:t,charges:i==="cache"?3:0};if(i==="solar")gi(n,"solar_kit");else if(i==="greenhouse"){n.position.addScaledVector(n.userData.up,-ir.floor),gi(n,"greenhouse");for(let[r,a]of[[-1.1,-1.2],[1.1,-1.2],[-1.1,1.2],[1.1,1.2]])tv(n,r,a,!0)}else if(i==="beacon"){let r=gi(n,"beacon");s.lamp=ws(r.part("lamp"),/^light_/)}else if(i==="cache"){let r=gi(n,"o2_cache");s.tanks=[0,1,2].map(a=>r.part("tank_"+a))}return A.builtMeshes.push(s),s}function up(i,e){let t=Ga()*Math.PI*2,n=40+Ga()*30,s=tr(A.hab,Math.sin(t)*n,Math.cos(t)*n,Ga()*6),r=ul(s,i,e||"Open supply pod");return Te.jingle(),Ne("Supply pod down, "+Math.round(n)+"m out. NASA delivers. No tip expected.","nasa"),r}function on(i,e,t,n,s){return(s||new C).set(e,t,n).applyQuaternion(i.quaternion).add(i.position)}function Za(i,e,t){return t=(t||new C).copy(e).sub(i.position),t.applyQuaternion(fi.copy(i.quaternion).invert())}var dl=[];function ou(i,e,t){let n=new Fo(1,i),s=n.attributes.position;for(let r=0;r<s.count;r++){let a=s.getX(r),o=s.getY(r),l=s.getZ(r),h=1+(Ln(a*1.3+e,o*1.3,l*1.3)*.38+Ln(a*3.1,o*3.1+e,l*3.1)*.16);a*=h,o*=h*t,l*=h,o<-.2&&(o=-.2+(o+.2)*.3),s.setXYZ(r,a,o,l)}return n.computeVertexNormals(),n}var lu=new qe,dp=new ht,fp=new ht,iv=new C,pp=new C,mp=new C,sv=new C(0,1,0),cu=new Me,rv=new C,hu=class{constructor(e,t,n={}){this.terrain=t,this.density=n.density===void 0?1:n.density,this.sets=new Map,this.dirty=!0,this.anchor=new C,this.lastCam=new C(1e9,0,0);let s=new Xn({color:16777215,roughness:.93,metalness:0,flatShading:!0});this.material=s,this.shadowRange=n.shadowRange||0;let r=(a,o,l)=>{let c=new os(a,s,o);return c.castShadow=l,c.receiveShadow=!0,c.frustumCulled=!1,c.count=0,c.instanceMatrix.setUsage(Ua),e.add(c),c};this.near=r(ou(2,1.7,.72),Math.round(220*this.density),this.shadowRange>0),this.far=[ou(1,9.2,.6),ou(1,4.4,.82)].map(a=>r(a,Math.round(700*this.density),!1)),this.small=r(ou(0,6.1,.62),Math.round(3200*this.density),!1),this.smallCap=this.small.instanceMatrix.count,t.onChunk=(a,o)=>{o.rocks&&o.rocks.length&&(this.sets.set(a,{kind:a.level===t.rockLevels.big?"big":"small",data:o.rocks,origin:o.origin}),this.dirty=!0)},t.onDispose=a=>{this.sets.delete(a)&&(this.dirty=!0)}}update(e){if(!this.dirty&&e.distanceToSquared(this.lastCam)<324)return;this.dirty=!1,this.lastCam.copy(e),this.anchor.copy(e);for(let o of[this.near,...this.far,this.small])o.position.copy(this.anchor);let t=0,n=0,s=[0,0];dl.length=0;let r=this.terrain.frame;for(let[o,l]of this.sets){if(o.used<r-2)continue;let c=l.kind==="big",h=c?520:85,u=l.data,d=l.origin;if(pp.set(d[0],d[1],d[2]),!(pp.distanceTo(e)>h+o.size))for(let p=0;p<u.length;p+=8){let g=d[0]+u[p],_=d[1]+u[p+1],v=d[2]+u[p+2],m=Math.hypot(g-e.x,_-e.y,v-e.z),x=u[p+6],S=u[p+7];if(m>h||c&&x<.9&&m>260)continue;mp.set(u[p+3],u[p+4],u[p+5]),dp.setFromUnitVectors(sv,mp),fp.setFromAxisAngle(sv,S*6.283).premultiply(dp),rv.set(Math.sin(S*40),0,Math.cos(S*40)),fp.multiply(dp.setFromAxisAngle(rv,(S-.5)*.7)),iv.set(x*(.75+S*7%1*.6),x*(.6+S*13%1*.7),x*(.75+S*29%1*.6)),lu.compose(pp.set(g-this.anchor.x,_-this.anchor.y,v-this.anchor.z),fp,iv);let y=S*3.7%1;if(cu.setRGB(.3-y*.16,.185-y*.095,.135-y*.06),c){if(m<Math.max(this.shadowRange,60)&&x>.6&&t<this.near.instanceMatrix.count)this.near.setMatrixAt(t,lu),this.near.setColorAt(t,cu),t++;else{let M=S<.5?0:1,b=this.far[M];if(s[M]>=b.instanceMatrix.count)continue;b.setMatrixAt(s[M],lu),b.setColorAt(s[M],cu),s[M]++}x>1.05&&m<140&&dl.push({v:mp.clone(),r:x*.62})}else{if(n>=this.smallCap)continue;this.small.setMatrixAt(n,lu),this.small.setColorAt(n,cu),n++}}}let a=(o,l)=>{o.count=l,o.instanceMatrix.needsUpdate=!0,o.instanceColor&&(o.instanceColor.needsUpdate=!0)};a(this.near,t),a(this.far[0],s[0]),a(this.far[1],s[1]),a(this.small,n),this.counts={big:t+s[0]+s[1],near:t,small:n,colliders:dl.length}}};function Hw(i=64){let e=document.createElement("canvas");e.width=e.height=i;let t=e.getContext("2d"),n=t.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.35,"rgba(255,255,255,0.55)"),n.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=n,t.fillRect(0,0,i,i);let s=new Ea(e);return s.colorSpace=li,s}function Gw(i){let e=document.createElement("canvas");e.width=64,e.height=128;let t=e.getContext("2d");if(t.fillStyle="#000",t.fillRect(0,0,64,128),i==="boot"){t.fillStyle="#555",t.beginPath(),t.ellipse(32,44,19,36,0,0,Math.PI*2),t.fill(),t.beginPath(),t.ellipse(32,104,15,19,0,0,Math.PI*2),t.fill(),t.fillStyle="#fff";for(let s=16;s<76;s+=11)t.fillRect(17,s,30,5);t.fillRect(20,94,24,6),t.fillRect(20,106,24,6)}else{let s=t.createLinearGradient(0,0,64,0);s.addColorStop(0,"#000"),s.addColorStop(.18,"#3a3a3a"),s.addColorStop(.82,"#3a3a3a"),s.addColorStop(1,"#000"),t.fillStyle=s,t.fillRect(0,0,64,128),t.lineWidth=6,t.strokeStyle="#d0d0d0";for(let r=-10;r<140;r+=32)t.beginPath(),t.moveTo(10,r+16),t.lineTo(32,r),t.lineTo(54,r+16),t.stroke()}let n=new Ea(e);return n.colorSpace=li,n.anisotropy=4,n}var Tn=new C,Ts=new ht,av=new ht,ov=new qe,Vw=new C,lv=new C(0,1,0),Gn=new C,Fn=new C,uu=class{constructor(e,t={}){this.scene=e,this.time=0,this.sprite=Hw(),this._initAir(t.air===void 0?1400:t.air),this._initPuffs(t.puffs||500),this._initMarks(t.marks||500)}_initAir(e){let t=new Float32Array(e*3),n=new Float32Array(e);for(let a=0;a<e;a++)t[a*3]=Math.random(),t[a*3+1]=Math.random(),t[a*3+2]=Math.random(),n[a]=Math.random();let s=new Lt;s.setAttribute("position",new ut(t,3)),s.setAttribute("aRnd",new ut(n,1)),this.airU={uTime:{value:0},uCam:{value:new C},uWind:{value:new C(1,0,0)},uUp:{value:new C(0,1,0)},uStorm:{value:0},uLight:{value:new Me(1,.8,.6)},uPx:{value:600},uMap:{value:this.sprite},uAmount:{value:1}};let r=new Ft({uniforms:this.airU,transparent:!0,depthWrite:!1,fog:!1,blending:Xs,vertexShader:`
        attribute float aRnd;
        uniform float uTime, uStorm, uPx, uAmount;
        uniform vec3 uCam, uWind, uUp;
        varying float vA;
        void main() {
          const float BOX = 70.0;
          // a box of motes that wraps around the camera: each stays put in the world as you move
          float speed = mix(1.5, 26.0, uStorm) * (0.6 + 0.8 * aRnd);
          vec3 world = position * BOX + uWind * (uTime * speed) - uUp * (uTime * (0.15 + uStorm * 1.2) * (0.5 + aRnd));
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
        }`});this.air=new Ws(s,r),this.air.frustumCulled=!1,this.air.renderOrder=20,this.scene.add(this.air)}_initPuffs(e){this.puffN=e,this.puffI=0;let t=new Lt;this.pStart=new ut(new Float32Array(e*3),3),this.pVel=new ut(new Float32Array(e*3),3),this.pInfo=new ut(new Float32Array(e*4),4);for(let s of[this.pStart,this.pVel,this.pInfo])s.setUsage(Ua);for(let s=0;s<e;s++)this.pInfo.setXYZW(s,-100,1,0,0);t.setAttribute("position",this.pStart),t.setAttribute("aVel",this.pVel),t.setAttribute("aInfo",this.pInfo),this.puffAnchor=new C,this.puffU={uTime:{value:0},uUp:{value:new C(0,1,0)},uLight:{value:new Me(1,.8,.6)},uPx:{value:600},uMap:{value:this.sprite},fogColor:{value:new Me},fogDensity:{value:0},fogNear:{value:1},fogFar:{value:2e3}};let n=new Ft({uniforms:this.puffU,transparent:!0,depthWrite:!1,fog:!0,vertexShader:`
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
        }`});this.puffs=new Ws(t,n),this.puffs.frustumCulled=!1,this.puffs.renderOrder=21,this.scene.add(this.puffs)}puff(e,t={}){let n=t.count||6,s=t.speed===void 0?1.2:t.speed,r=t.up===void 0?.8:t.up,a=t.spread===void 0?.25:t.spread,o=t.size||.5,l=t.life||1.6;if(e.distanceToSquared(this.puffAnchor)>400*400){for(let c=0;c<this.puffN;c++)this.pInfo.setX(c,-100);this.puffAnchor.copy(e),this.puffs.position.copy(e)}Fn.copy(e).normalize(),Gn.set(-Fn.z,0,Fn.x).normalize(),Tn.crossVectors(Fn,Gn);for(let c=0;c<n;c++){let h=this.puffI;this.puffI=(this.puffI+1)%this.puffN;let u=Math.random()*Math.PI*2,d=Math.sqrt(Math.random()),p=Math.cos(u)*d*a,g=Math.sin(u)*d*a;this.pStart.setXYZ(h,e.x-this.puffAnchor.x+Gn.x*p+Tn.x*g,e.y-this.puffAnchor.y+Gn.y*p+Tn.y*g,e.z-this.puffAnchor.z+Gn.z*p+Tn.z*g);let _=s*(.4+Math.random()*.9),v=r*(.5+Math.random()),m=Gn.x*Math.cos(u)*_+Tn.x*Math.sin(u)*_+Fn.x*v,x=Gn.y*Math.cos(u)*_+Tn.y*Math.sin(u)*_+Fn.y*v,S=Gn.z*Math.cos(u)*_+Tn.z*Math.sin(u)*_+Fn.z*v;t.dir&&(m+=t.dir.x,x+=t.dir.y,S+=t.dir.z),this.pVel.setXYZ(h,m,x,S),this.pInfo.setXYZW(h,this.time,l*(.7+Math.random()*.6),o*(.6+Math.random()*.8),t.tone||0)}this.pStart.needsUpdate=!0,this.pVel.needsUpdate=!0,this.pInfo.needsUpdate=!0}_initMarks(e){this.markN=e;let t=(n,s,r)=>{let a=new Er(s,r);a.rotateX(-Math.PI/2);let o=new dn({color:1838342,alphaMap:Gw(n),transparent:!0,opacity:.5,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:!0}),l=new os(a,o,e);return l.count=0,l.frustumCulled=!1,l.renderOrder=2,l.instanceMatrix.setUsage(Ua),this.scene.add(l),{mesh:l,i:0,used:0,world:new Float64Array(e*3),quat:new Float32Array(e*4),anchor:new C}};this.boots=t("boot",.16,.34),this.tyres=t("tyre",.46,.9)}mark(e,t,n){let s=e==="boot"?this.boots:this.tyres,r=s.i;s.i=(s.i+1)%this.markN,s.used=Math.min(this.markN,s.used+1),Fn.copy(t).normalize(),Ts.setFromUnitVectors(lv,Fn),Gn.copy(n).addScaledVector(Fn,-n.dot(Fn)).normalize(),Tn.set(0,0,-1).applyQuaternion(Ts);let a=Math.atan2(Tn.clone().cross(Gn).dot(Fn),Tn.dot(Gn));av.setFromAxisAngle(lv,a),Ts.multiply(av),s.world[r*3]=t.x,s.world[r*3+1]=t.y,s.world[r*3+2]=t.z,s.quat[r*4]=Ts.x,s.quat[r*4+1]=Ts.y,s.quat[r*4+2]=Ts.z,s.quat[r*4+3]=Ts.w,s.used===1||Tn.set(t.x,t.y,t.z).distanceToSquared(s.anchor)>300*300?this._reanchor(s,t):this._write(s,r),s.mesh.count=s.used,s.mesh.instanceMatrix.needsUpdate=!0}_write(e,t){Tn.set(e.world[t*3]-e.anchor.x,e.world[t*3+1]-e.anchor.y,e.world[t*3+2]-e.anchor.z),Fn.set(e.world[t*3],e.world[t*3+1],e.world[t*3+2]).normalize(),Tn.addScaledVector(Fn,.025),Ts.set(e.quat[t*4],e.quat[t*4+1],e.quat[t*4+2],e.quat[t*4+3]),ov.compose(Tn,Ts,Vw.set(1,1,1)),e.mesh.setMatrixAt(t,ov)}_reanchor(e,t){e.anchor.copy(t),e.mesh.position.copy(t);for(let n=0;n<e.used;n++)this._write(e,n)}update(e,t,n){this.time+=e;let s=Fn.copy(t.position).normalize();Gn.set(-s.z,0,s.x).normalize(),Tn.crossVectors(s,Gn);let r=Math.sin(this.time*.013)*.6,a=(n.pixelHeight||720)/(2*Math.tan(t.fov*Math.PI/360)),o=Math.min(1.6,.25+n.sunIntensity*.32),l=this.airU;l.uTime.value=this.time,l.uCam.value.copy(t.position),l.uUp.value.copy(s),l.uWind.value.copy(Gn).multiplyScalar(Math.cos(r)).addScaledVector(Tn,Math.sin(r)),l.uStorm.value=n.storm,l.uPx.value=a,l.uAmount.value=n.inside?0:Math.max(0,1-(t.position.length()-12e3)/900),l.uLight.value.setRGB(.86*o+n.ambient.r*.4,.62*o+n.ambient.g*.4,.44*o+n.ambient.b*.4),this.air.visible=l.uAmount.value>.01;let c=this.puffU;c.uTime.value=this.time,c.uUp.value.copy(s),c.uPx.value=a,c.uLight.value.setRGB(o*.75+n.ambient.r*.8,o*.72+n.ambient.g*.8,o*.7+n.ambient.b*.8)}};var fl=new Map;function du(i,e){return fl.has(i)||fl.set(i,[]),fl.get(i).push(e),()=>Ww(i,e)}function Ww(i,e){let t=fl.get(i);if(t){let n=t.indexOf(e);n>=0&&t.splice(n,1)}}function Es(i,e){let t=fl.get(i);if(t)for(let n of t.slice())n(e)}var sr={scrap:"Scrap Metal",circuit:"Circuit Board",regolith:"Regolith",ice:"Ice Chunk",candle:"O2 Candle",kitSolar:"Solar Panel Kit",kitGreenhouse:"Greenhouse Kit",kitBeacon:"Nav Beacon Kit",kitCache:"O2 Cache Kit"},gp=[{id:"candle",name:"O2 Candle",desc:"+40 suit O2 in the field (press X)",cost:{scrap:2,regolith:1},gives:{candle:1}},{id:"meltIce",name:"Melt Ice",desc:"+10L water (uses 2 PWR)",cost:{ice:1},run:()=>f.power<2?"Not enough hab power":(f.power-=2,f.water=ye(f.water+Pe.iceWater,0,Pe.waterMax),!0)},{id:"kitSolar",name:"Portable Solar Panel",desc:"Deployable: recharges the rover nearby; boosts hab power if placed at home",cost:{scrap:4,circuit:1},gives:{kitSolar:1}},{id:"kitGreenhouse",name:"Greenhouse Dome",desc:"Deployable: 4 farm plots, anywhere on Mars",cost:{scrap:8,circuit:2},gives:{kitGreenhouse:1}},{id:"kitBeacon",name:"Nav Beacon",desc:"Deployable: permanent map + compass marker",cost:{scrap:2,circuit:1},gives:{kitBeacon:1}},{id:"kitCache",name:"O2 Cache",desc:"Deployable: 3 suit-O2 refills in the field",cost:{scrap:3,candle:1},gives:{kitCache:1}}],fu=[{id:"drive1",name:"Rover Drivetrain I",desc:"Top speed 35 \u2192 45 m/s",cost:{scrap:6,circuit:1}},{id:"drive2",name:"Rover Drivetrain II",desc:"Top speed 45 \u2192 55 m/s",cost:{scrap:10,circuit:2},bp:"drive2",needs:"drive1"},{id:"roverBattery",name:"Rover Battery Bank",desc:"Rover power 100 \u2192 160, night drain \u221225%",cost:{scrap:8,circuit:1}},{id:"tank1",name:"Suit Tank I",desc:"Suit O2 100 \u2192 150",cost:{scrap:4}},{id:"tank2",name:"Suit Tank II",desc:"Suit O2 150 \u2192 200",cost:{scrap:8,circuit:1},bp:"tank2",needs:"tank1"},{id:"recycler",name:"Suit CO2 Recycler",desc:"EVA O2 drain \u221225%",cost:{scrap:6,circuit:2},bp:"recycler"},{id:"insulation",name:"Hab Insulation",desc:"Hab base power draw \u221230%",cost:{scrap:6}},{id:"wiper",name:"Panel Auto-Wiper",desc:"Panel dust accrual \u221270%",cost:{scrap:5,circuit:1}},{id:"drill",name:"Ice Drill",desc:"Unlocks mining at ice deposits",cost:{scrap:4,circuit:1},bp:"drill"},{id:"rtg",name:"Socket the RTG",desc:"Cold stops draining power; +6 PWR/sol at night",cost:{},needsRtg:!0}];function pl(i){for(let e in i)if((f.inv[e]||0)<i[e])return!1;return!0}function pu(i){for(let e in i)f.inv[e]-=i[e]}function vp(i){let e=Object.keys(i).map(t=>`${i[t]} ${sr[t]||t}`);return e.length?e.join(" + "):"free"}function bp(i){let e=[];for(let t in i)t==="rations"?(f.food+=i[t],e.push(`${i[t]} rations`)):t==="water"?(f.water=ye(f.water+i[t],0,Pe.waterMax),e.push(`${i[t]}L water`)):t==="hydrazine"?(f.hydrazine+=i[t],e.push(`${i[t]} hydrazine`)):(f.inv[t]=(f.inv[t]||0)+i[t],e.push(`${i[t]} ${sr[t]||t}`));return Te.pickup(),e.join(", ")}function mu(){return A.hab&&it(O.pos,A.hab.position)<120}window.addEventListener("keydown",i=>{i.key.toLowerCase()!=="x"||!f.started||f.uiOpen||En()||f.over||(f.inv.candle||0)>0&&f.suit<Zt()-5&&(f.inv.candle--,f.suit=ye(f.suit+40,0,Zt()),Te.ok(),Ne("Cracked an O2 candle. Chemistry: still my favorite roommate."))});var gu=[];function Rt(i){gu.push(i),i.priority===void 0&&(i.priority=0)}var Ri={active:null},xp=null;function cv(i){if(Ri.active=null,f.uiOpen||En()||f.over||f.mode==="cutscene"){Z.prompt.style.display="none";return}let e=null,t=1e9,n=1e9,s=f.mode==="rover"?A.rover.group.position:O.pos;for(let a of gu){if(a.mode&&a.mode!==f.mode||a.visible&&!a.visible())continue;let o=a.pos();if(!o)continue;let l=it(s,o);l>a.r||(a.priority<n||a.priority===n&&l<t)&&(n=a.priority,t=l,e=a)}if(!e){Z.prompt.style.display="none",Z.promptSub.textContent="",f.holdT=0,xp=null;return}Ri.active=e,e!==xp&&(f.holdT=0,xp=e);let r=e.enabled?e.enabled():!0;if(Z.prompt.style.display="block",Z.promptSub.textContent=e.sub?e.sub():"",r!==!0){Z.promptText.innerHTML=`<span style="opacity:.75">${typeof r=="string"?r:e.label()}</span>`,Z.hold.style.display="none",f.holdT=0;return}Z.promptText.innerHTML=`<span class="key">E</span>${e.hold>.7?"HOLD \u2014 ":""}${e.label()}`,ze.eHeld?(f.holdT+=i,Z.hold.style.display="block",Z.holdFill.style.width=ye(f.holdT/e.hold*100,0,100)+"%",f.holdT>=e.hold&&(f.holdT=0,ze.eHeld=!1,Z.hold.style.display="none",e.use())):(f.holdT=0,Z.hold.style.display="none")}var qw=new Me(9067060),Xw=new ht().setFromAxisAngle(new C(1,0,0),-1.9);function yp(i){if(i.kind!=="pod"){Hr(i.group,!i.taken),ru(i.cols,!i.taken);return}i.lid&&(i.lidRest||(i.lidRest=i.lid.quaternion.clone()),i.lid.quaternion.copy(i.lidRest),i.taken&&i.lid.quaternion.multiply(Xw)),i.taken&&qi(i.strobe,0)}function _p(i){i.blocks.forEach((e,t)=>{let n=t<i.left;e.node.visible=n,e.col.r=n?e.col.r0:.001})}function An(){for(let t of A.plots)Gr(t);for(let t of A.panels){let n=ye(t.dust,0,1);for(let s of t.cells){s.userData.clean||(s.userData.clean={color:s.color.clone(),rough:s.roughness,metal:s.metalness});let r=s.userData.clean;s.color.copy(r.color).lerp(qw,n*.9),s.roughness=r.rough+(.95-r.rough)*n,s.metalness=r.metal*(1-n)}}for(let t of A.soilPiles)Hr(t.group,t.left>0),ru(t.cols,t.left>0),t.mesh.scale.setScalar(.55+.225*t.left);A.breachHole&&(A.breachHole.visible=f.breach.active),A.breachPatch&&(A.breachPatch.visible=f.breach.done&&!f.breach.active);let i=f.power>.5;qi(A.commsMats,f.pf.connected&&i?1:.04),qi(A.oxyMats,i?1:.05);for(let t of A.habLights)t.intensity=i?t.userData.on:t.userData.on*.05;for(let t of A.pods)yp(t);A.rtgSite&&(Hr(A.rtgSite.group,!A.rtgSite.taken),ru(A.rtgSite.cols,!A.rtgSite.taken));for(let t of A.iceSites)_p(t);for(let t of A.builtMeshes)t.tanks&&t.tanks.forEach((n,s)=>{n&&(n.visible=s<t.charges)});let e=A.pathfinder;if(f.pf.connected)e.parent!==ce.world&&ce.world.add(e),on(A.hab,13.5,0,5.5,e.position),e.position.normalize().multiplyScalar(At(e.position)),Gi(Ce.copy(e.position).normalize(),.3,e.quaternion),e.scale.set(1,1,1),A.pfCollider.r=.001,Hr(A.uplinkRing,!1);else if(f.pf.loaded){let t=A.rover.cargo||A.rover.group;if(e.parent!==t){t.add(e),A.rover.cargo?e.position.set(0,0,0):e.position.set(0,2.15,-1.1),e.quaternion.set(0,0,0,1);let n=A.pfModel?.5:.8;e.scale.set(n,n,n)}A.pfCollider.r=.001,Hr(A.uplinkRing,!0)}else{e.parent!==ce.world&&ce.world.add(e);let t=kt(19.13,326.79);e.position.copy(t).multiplyScalar(At(t)),Gi(t,.7,e.quaternion),e.scale.set(1,1,1),A.pfCollider.r=2.2,Hr(A.uplinkRing,!1)}}var pt={q:new ht,speed:0,steer:0,camPos:new C,camInit:!1,camYaw:0,camPitch:0,camIdle:9,pitch:0,roll:0,pitchV:0,rollV:0,heave:0,heaveV:0,slope:0,slip:0,throttle:0},Sp=new C,eo=new C,ml=new C,rr=new C,Mp=new C,jw=new C(0,0,1);function gl(i,e){Gi(Ce.copy(i).normalize(),e||0,pt.q),pt.speed=0,pt.steer=0,pt.pitch=0,pt.roll=0,pt.pitchV=0,pt.rollV=0,pt.heave=0,pt.heaveV=0,vu(0)}function Qa(i){return i.set(0,1,0).applyQuaternion(pt.q)}function vu(i){let e=pt,t=A.rover.group;Qa(rr);let n=At(rr);eo.set(0,0,-1).applyQuaternion(e.q),ml.set(1,0,0).applyQuaternion(e.q),t.position.copy(rr).multiplyScalar(n);let s=At(wn.copy(t.position).addScaledVector(eo,1.9)),r=At(wn.copy(t.position).addScaledVector(eo,-1.9)),a=At(wn.copy(t.position).addScaledVector(ml,1.25)),o=At(wn.copy(t.position).addScaledVector(ml,-1.25)),l=Math.atan2(s-r,3.8),c=Math.atan2(o-a,2.5),h=(s+r+a+o)/4-n;i<=0?(e.pitch=l,e.roll=c,e.heave=h,e.pitchV=e.rollV=e.heaveV=0):(e.pitchV+=((l-e.pitch)*110-e.pitchV*15)*i,e.pitch+=e.pitchV*i,e.rollV+=((c-e.roll)*110-e.rollV*15)*i,e.roll+=e.rollV*i,e.heaveV+=((h-e.heave)*160-e.heaveV*18)*i,e.heave+=e.heaveV*i,e.pitch=ye(e.pitch,-.9,.9),e.roll=ye(e.roll,-.8,.8),e.heave=ye(e.heave,-.6,.6)),t.position.addScaledVector(rr,e.heave),t.quaternion.copy(e.q).multiply(_s.setFromAxisAngle(ol,e.pitch)).multiply(fi.setFromAxisAngle(jw,e.roll)),A.roverCollider.v.copy(rr);let u=A.rover;if(u.wheels.length===6){u.wheelRest||(u.wheelRest=u.wheels.map(d=>({y:d.position.y,pos:d.getWorldPosition(new C).sub(t.position).applyQuaternion(fi.copy(t.quaternion).invert())}))),t.updateMatrixWorld(!0);for(let d=0;d<6;d++){let p=u.wheels[d],g=u.wheelRest[d];Mp.copy(g.pos).applyQuaternion(t.quaternion).add(t.position);let _=At(Mp),v=Mp.length()-_,m=ye(cp-v,-.22,.28);p.userData.travel=nt(p.userData.travel||0,m,i>0?Kt(.04,i):1),p.position.y=g.y+p.userData.travel}}}function hv(){f.mode="rover",pt.camInit=!1,pt.camYaw=0,pt.camPitch=0,ze.yaw=0,ze.pitch=0,Te.click(),Es("rover-enter",{})}function vl(){f.mode="walk",pt.speed=0,O.q.copy(pt.q),Vr(O.q,1,0,3.4,12e3),bu(O.q,.42),O.alt=0,O.vy=0,O.vx=0,O.vz=0,O.face=0,O.onGround=!0,ji(),Te.click(),Es("rover-exit",{})}function uv(i){let e=pt,t=ze.keys,n=ze.touch,s=(t.w||t.arrowup?1:0)-(t.s||t.arrowdown?1:0);Math.abs(n.joyY)>.2&&(s=ye(-n.joyY*1.2,-1,1));let r=(t.a||t.arrowleft?1:0)-(t.d||t.arrowright?1:0);Math.abs(n.joyX)>.15&&(r=ye(-n.joyX*1.2,-1,1)),e.throttle=s;let o=f.roverPower<=.5?5:Af();Qa(rr),eo.set(0,0,-1).applyQuaternion(e.q),e.slope=Jh(A.rover.group.position,3.2,Sp);let l=-Sp.dot(eo)*e.slope,c=Pe.gravity,h=Math.sign(e.speed)||Math.sign(s)||1,u=0;s>0?u+=11*s*ye(1-e.speed/o,0,1)*(e.speed<0?1.8:1):s<0&&(u+=e.speed>.5?-17:-8*ye(1+e.speed/9,0,1)),u-=c*l/Math.sqrt(1+l*l),u-=h*(.35+Math.abs(e.speed)*.045),s===0&&Math.abs(e.speed)<3&&(u-=e.speed*2.2),e.speed+=u*i;let d=ye(1.25-l*1.55,0,1);l>.2&&e.speed>o*d&&(e.speed=nt(e.speed,o*d,Kt(.25,i))),e.speed=ye(e.speed,-9,o*1.15),Math.abs(e.speed)<.03&&s===0&&(e.speed=0);let p=nt(.55,.16,ye(Math.abs(e.speed)/40,0,1));e.steer=nt(e.steer,r*p,Kt(r?.12:.08,i)),Math.abs(e.speed)>.05&&bl(e.q,e.speed*Math.tan(e.steer)/3.8*i),ml.set(1,0,0).applyQuaternion(e.q);let g=Sp.dot(ml)*e.slope;e.slip=Math.abs(g)>.55?Math.sign(g)*(Math.abs(g)-.55)*9:0;let _=e.speed*i;Math.abs(_)>1e-5&&(Vr(e.q,0,-Math.sign(_),Math.abs(_),12e3),f.stats.driven+=Math.abs(_)),e.slip&&Vr(e.q,Math.sign(e.slip),0,Math.abs(e.slip)*i,12e3),bu(e.q,2)&&(Math.abs(e.speed)>6&&(f.shake=Math.max(f.shake,.35),Es("rover-bump",{speed:Math.abs(e.speed)})),e.speed*=.35),e.q.normalize(),vu(i),O.q.copy(e.q),O.alt=0,O.vy=0,ji();let v=Qa(Ce).dot(ce.engine.sunDir),m=v<.05;if(Math.abs(e.speed)>.5){let L=Pe.roverDrainPerMin/60*(.5+Math.abs(e.speed)/Af())*(1+Math.max(0,l)*1.5);m&&(L*=f.upgrades.roverBattery?1.5:2),f.roverPower=ye(f.roverPower-L*i,0,Zs())}else m||(f.roverPower=ye(f.roverPower+2/60*v*i,0,Zs()));let x=A.rover,S=e.speed*i/cp;for(let L of x.wheels)L.rotation.x+=S;x.steer.FL&&(x.steer.FL.rotation.y=e.steer,x.steer.FR.rotation.y=e.steer),x.steer.RL&&(x.steer.RL.rotation.y=-e.steer*.45,x.steer.RR.rotation.y=-e.steer*.45);let y=m||f.storm.i>.5;x.headlight.intensity=nt(x.headlight.intensity,y?320:0,Kt(.15,i));for(let L of x.lamps)L.emissiveIntensity=L.userData.baseEmissive*(y?1.6:.12);x.dish&&(x.dish.rotation.y+=i*.15),(ze.yaw||ze.pitch)&&(e.camYaw+=ze.yaw,e.camPitch=ye(e.camPitch+ze.pitch*(ze.invertY?-1:1),-.5,.9),e.camIdle=0),ze.yaw=0,ze.pitch=0,e.camIdle+=i,e.camIdle>2.2&&(e.camYaw=nt(e.camYaw,0,Kt(.5,i)),e.camPitch=nt(e.camPitch,0,Kt(.5,i))),Qa(rr),fi.copy(e.q).multiply(_s.setFromAxisAngle(Ge.set(0,1,0),e.camYaw+e.steer*.35));let R=9.8+Math.abs(e.speed)*.07,M=4.3+e.camPitch*5;Ve.set(0,0,1).applyQuaternion(fi),wn.copy(A.rover.group.position).addScaledVector(Ve,R*Math.cos(e.camPitch*.6)).addScaledVector(rr,M),e.camInit||(e.camPos.copy(wn),e.camInit=!0),e.camPos.lerp(wn,Kt(.12,i));let b=At(e.camPos)+1;e.camPos.length()<b&&e.camPos.normalize().multiplyScalar(b);let w=ce.engine.camera;w.position.copy(e.camPos),f.shake>0&&(f.shake=Math.max(0,f.shake-i*1.6),ze.reducedMotion||w.position.addScaledVector(Ce.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.4)),ar(Ge.copy(A.rover.group.position).addScaledVector(Qa(Ce),1.9).addScaledVector(eo.set(0,0,-1).applyQuaternion(e.q),2.5+Math.abs(e.speed)*.1),Qa(Ce)),w.fov=nt(w.fov,ce.engine.baseFov+4+Math.abs(e.speed)*.22,Kt(.3,i)),w.updateProjectionMatrix(),f.inside=!1}function xu(){return{v:dv,diff:f.diff,spawn:{lat:A.spawn.lat,lon:A.spawn.lon},sol:f.sol,tod:f.tod,o2:f.o2,water:f.water,food:f.food,potatoes:f.potatoes,power:f.power,health:Math.max(f.health,50),suit:Zt(),roverPower:f.roverPower,roverO2:f.roverO2,hydrazine:f.hydrazine,inv:{...f.inv},upgrades:{...f.upgrades},blueprints:{...f.blueprints},quests:{...f.quests},salvaged:{...f.salvaged},discovered:{...f.discovered},achieved:{...f.achieved},checkedSystems:{...f.checkedSystems},flags:{...f.flags},stats:{...f.stats},breach:{...f.breach},pf:{...f.pf},stormCells:f.storm.cells.map(i=>({...i})),plots:A.plots.map(i=>({state:i.state,growth:i.growth,watered:i.watered})),panels:A.panels.map(i=>i.dust),piles:A.soilPiles.map(i=>i.left),pods:A.pods.map(i=>i.taken),podLoot:A.pods.map(i=>({loot:i.loot,label:i.label,blueprint:i.blueprint||null,ll:Jn(Ce.copy(i.group.position).normalize())})),ice:A.iceSites.map(i=>i.left),rtgTaken:A.rtgSite?A.rtgSite.taken:!1,built:A.builtMeshes.map(i=>({kind:i.kind,charges:i.charges,yaw:i.yaw||0,ll:Jn(Ce.copy(i.group.position).normalize())})),playerQ:O.q.toArray(),roverQ:pt.q.toArray()}}function xl(i){Object.assign(f,{sol:i.sol,tod:i.tod,o2:i.o2,water:i.water,food:i.food,potatoes:i.potatoes,power:i.power,health:i.health,suit:i.suit,roverPower:i.roverPower,roverO2:i.roverO2,hydrazine:i.hydrazine}),f.inv={...i.inv},f.upgrades={...i.upgrades},f.blueprints={...i.blueprints},f.quests={...i.quests},f.salvaged={...i.salvaged},f.discovered={...i.discovered},f.achieved={...i.achieved},f.checkedSystems={...i.checkedSystems},f.flags={...i.flags},f.stats={...i.stats},f.breach={...i.breach},f.pf={...i.pf},f.storm.cells=i.stormCells.map(e=>({...e})),f.storm.i=0;for(let e=A.builtMeshes.length;e<(i.built||[]).length;e++){let t=i.built[e],n=au(t.kind,kt(t.ll.lat,t.ll.lon),t.yaw||0);n.charges=t.charges}i.plots.forEach((e,t)=>{A.plots[t]&&Object.assign(A.plots[t],e)}),i.panels.forEach((e,t)=>{A.panels[t]&&(A.panels[t].dust=e)}),i.piles.forEach((e,t)=>{A.soilPiles[t]&&(A.soilPiles[t].left=e)});for(let e=A.pods.length;e<(i.podLoot||[]).length;e++){let t=i.podLoot[e],n=ul(Xi(t.ll.lat,t.ll.lon,e*2.1),t.loot,t.label);t.blueprint&&(n.blueprint=t.blueprint)}i.pods.forEach((e,t)=>{A.pods[t]&&(A.pods[t].taken=e)}),i.ice.forEach((e,t)=>{A.iceSites[t]&&(A.iceSites[t].left=e)}),A.rtgSite&&(A.rtgSite.taken=i.rtgTaken);for(let e=0;e<Math.min(A.builtMeshes.length,i.built.length);e++)A.builtMeshes[e].charges=i.built[e].charges;O.q.fromArray(i.playerQ),O.alt=0,O.vy=0,pt.q.fromArray(i.roverQ),pt.speed=0,f.over=!1,f.dead=null,f.sleeping=!1,f.mode="walk",f.uiOpen=!1,Te.alarm(!1),Te.disco(!1),f.disco=!1,Z.vign.style.opacity=0,ji(),vu(0),An(),Br()}var Wr={checkpoint:null};function Ki(){f.over||(Wr.checkpoint=xu())}function yu(){if(!Wr.checkpoint){try{location.reload()}catch{}return}xl(JSON.parse(JSON.stringify(Wr.checkpoint))),Ne(`Woke at dawn, Sol ${f.sol}. Bad dream. Probably prophetic. Let's not test it.`)}var _u="stranded2-save";function As(){if(!(f.over||!f.started))try{localStorage.setItem(_u,JSON.stringify(xu()))}catch{}}var dv=3;function Kw(i){return!i||typeof i!="object"||!i.spawn||!i.playerQ?null:(i.v===2&&(i={...i,v:3,migrated:["terrain"]}),i.v===dv?i:null)}function wp(){try{let i=localStorage.getItem(_u);return i?Kw(JSON.parse(i)):null}catch{return null}}function fv(){try{return!!localStorage.getItem(_u)&&!wp()}catch{return!1}}function to(){try{localStorage.removeItem(_u)}catch{}}var Yw=[{id:"reach",text:()=>"Suit breach \u2014 get to the Hab",shown:()=>!0,done:()=>f.flags.suitSealed},{id:"systems",text:()=>`Inspect the oxygenator & reclaimer (${Object.keys(f.checkedSystems).length}/2)`,shown:()=>f.flags.suitSealed,done:()=>Object.keys(f.checkedSystems).length>=2},{id:"math",text:()=>"Run the numbers at the comms desk",shown:()=>Object.keys(f.checkedSystems).length>=2,done:()=>f.flags.didMath},{id:"panels",text:()=>`Wipe down solar panels (${Math.min(f.stats.panels,3)}/3)`,shown:()=>f.flags.suitSealed,done:()=>f.stats.panels>=3},{id:"farm",text:()=>`Start the farm \u2014 plant 3 beds (${Math.min(_l(),3)}/3)`,shown:()=>f.flags.didMath,done:()=>_l()>=3||f.stats.potatoes>0},{id:"hydra",text:()=>"Make water: burn hydrazine (carefully)",shown:()=>f.flags.didMath,done:()=>f.stats.booms>=1},{id:"pf",text:()=>f.pf.loaded?"Bring Pathfinder to the uplink ring":`Recover Pathfinder \u2014 Ares Vallis, ${ui(it(O.pos,A.pathfinder.position))}`,shown:()=>f.flags.pfRevealed,done:()=>f.pf.connected},{id:"harvest",text:()=>`Harvest potatoes (${f.stats.potatoes} banked)`,shown:()=>_l()>0,done:()=>f.stats.potatoes>=4},{id:"breach",text:()=>"SEAL THE BREACH",shown:()=>f.breach.active,done:()=>!f.breach.active,urgent:!0},{id:"survive",text:()=>`Survive to Sol ${f.rescueSol} (Sol ${f.sol})`,shown:()=>f.pf.connected,done:()=>f.sol>=f.rescueSol},{id:"mav",text:()=>`Get to the MAV \u2014 Schiaparelli, ${ui(it(O.pos,A.mav.position))}`,shown:()=>f.flags.mavRevealed,done:()=>f.won}],pv=new Set,mv=0;function vv(){if(Dn()-mv<.3)return;mv=Dn();let i='<div class="ttl">MISSION</div>',e=0;for(let n of Yw){if(!n.shown())continue;let s=n.done();if(s&&!pv.has(n.id)&&(pv.add(n.id),n.id!=="reach"&&Te.jingle()),!(s&&n.id!=="mav")){if(e>=4)break;i+=`<div class="mg-obj${s?" done":""}"${n.urgent?' style="color:#ff6f5f"':""}>\u25B8 ${n.text()}</div>`,e++}}let t=Xr.filter(n=>f.quests[n.id]==="active"&&Rs(n)).map(n=>({q:n,d:it(O.pos,Rs(n))})).sort((n,s)=>n.d-s.d).slice(0,2);for(let{q:n,d:s}of t){if(e>=6)break;i+=`<div class="mg-obj quest">\u25B8 ${n.name} \u2014 ${ui(s)}</div>`,e++}Z.objectives.innerHTML=i}var yl={},gv=0;function Tp(i,e,t){if(Ce.copy(i).normalize(),hi(Ce,di,Vi),Ve.copy(e).normalize().sub(Ce.clone().multiplyScalar(Ce.dot(Ve.copy(e).normalize()))),Ve.copy(e).normalize(),Ge.copy(Ve).sub(Ce.clone().multiplyScalar(Ce.dot(Ve))),Ge.lengthSq()<1e-10)return 0;let n=Ge.dot(di),s=Ge.dot(Vi),r=Math.atan2(n,s);Ve.set(0,0,-1).applyQuaternion(t),Ge.copy(Ve).sub(Ce.clone().multiplyScalar(Ce.dot(Ve)));let a=Ge.dot(di),o=Ge.dot(Vi),l=Math.atan2(a,o),c=r-l;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;return c}function bv(){if(Dn()-gv<.12)return;gv=Dn();let i=f.mode==="rover"?A.rover.group.position:O.pos,e=f.mode==="rover"?pt.q:O.q,t=[];t.push(["hab","\u2302 HAB",A.hab.position]),f.flags.coldOpen||t.push(["rover","\u25A3 ROVER",A.rover.group.position]),f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected&&t.push(["pf","\u25BC PATHFINDER",A.pathfinder.position]),f.pf.loaded&&!f.pf.connected&&t.push(["up","\u25BC UPLINK",A.uplink.position]),f.flags.mavRevealed&&!f.won&&t.push(["mav","\u25B2 MAV",A.mav.position]),f.breach.active&&t.push(["br","\u26A0 BREACH",on(A.hab,0,0,-Qn+1,Ve).clone()]);let n=0;for(let a of A.builtMeshes)a.kind==="beacon"&&t.push(["bc"+n++,"\u25C6 BEACON",a.group.position]);let s=Xr.filter(a=>f.quests[a.id]==="active"&&Rs(a)).map(a=>({q:a,d:it(i,Rs(a))})).sort((a,o)=>a.d-o.d).slice(0,2);for(let{q:a}of s)t.push(["q"+a.id,"\u2605 "+a.target.toUpperCase(),Rs(a)]);for(let a of A.pods)!a.taken&&it(i,a.group.position)<8e3&&t.push(["pod"+A.pods.indexOf(a),"\u25BD CACHE",a.group.position]);let r=new Set;for(let[a,o,l]of t){r.add(a);let c=yl[a];c||(c=gt("div",null,"mg-cmark",Z.compass),yl[a]=c);let h=it(i,l);if(h<6){c.style.display="none";continue}let u=Tp(i,l,e),d=1.15,p=ye(u/d,-1,1)*.5+.5;c.style.display="block",c.style.left=p*100+"%",c.style.opacity=Math.abs(u)>d?.35:.95,c.innerHTML=`<div class="ic">${o.split(" ")[0]}</div>${o.split(" ").slice(1).join(" ")}<br>${ui(h)}`}for(let a in yl)r.has(a)||(yl[a].remove(),delete yl[a]);Z.region.textContent=iu(Ce.copy(i).normalize()).toUpperCase()}function Jw(){let e=((Jn(Ce.copy(O.pos).normalize()).lon+f.tod*360)/360*24.66+12)%24.66;e<0&&(e+=24.66);let t=Math.floor(e%1*60);return`LT ${String(Math.floor(e)).padStart(2,"0")}:${String(t).padStart(2,"0")}`}function xv(){let i=[["suit",f.suit,Zt(),Math.round(f.suit)+"%"],["o2",f.o2,100,Math.round(f.o2)+"%"],["water",f.water,Pe.waterMax,f.water.toFixed(0)+"L"],["food",f.food+f.potatoes,16,`${f.food}R+${f.potatoes}P`],["power",f.power,100,Math.round(f.power)+"%"],["health",f.health,100,Math.round(f.health)+"%"]];for(let[s,r,a,o]of i){let l=Z.bars[s];l&&(l.fill.style.width=ye(r/a*100,0,100)+"%",l.val.textContent=o,l.wrap.classList.toggle("warn",r/a<.22))}let e=Su(Ce.copy(O.pos).normalize(),qr());ze.isTouch&&(Z.tExit.style.display=f.mode==="rover"?"flex":"none",Z.tJump.style.display=f.mode==="rover"?"none":"flex");let t=`<span class="sol">SOL ${f.sol}</span><br>${Jw()} \xB7 ${e}\xB0C`;f.mode==="rover"&&(t+=`<br><span style="font-size:11px">ROVER PWR ${Math.round(f.roverPower)} \xB7 O2 ${Math.round(f.roverO2)}</span>`),f.storm.i>.15&&(t+='<br><span style="color:#ff6f5f;font-size:11px">\u26A0 DUST STORM</span>'),Z.clock.innerHTML=t;let n=Math.max(1-f.suit/(Zt()*.25),1-f.health/45,f.breach.active&&f.inside?.5:0);Z.vign.style.opacity=ye(n,0,1)*.9,Z.cold.style.opacity=ye((-70-e)/40,0,1)*(f.inside?0:.85),f.disco&&(f.stats.discoTime+=1/60)}function Mu(){try{location.reload()}catch{}setTimeout(()=>ll("SYSTEM","Reload blocked by host page","Refresh the page manually to restart."),400)}function _v(i){if(f.over)return;f.over=!0,f.dead=i,Te.alarm(!1),Te.disco(!1),Te.bad(),Te.rumble(0);let e=f.diff==="iron";e&&to();let t=[];!e&&Wr.checkpoint&&t.push({label:`WAKE AT DAWN (SOL ${Wr.checkpoint.sol})`,fn:()=>yu()}),t.push({label:"RESTART FROM SOL 1",ghost:!e,keep:!0,fn:()=>{to(),Mu()}}),pi({title:"YOU DIED ON MARS",subtitle:`Sol ${f.sol} \xB7 ${(f.stats.driven/1e3).toFixed(1)} km driven \xB7 ${f.stats.potatoes} potatoes grown`+(e?" \xB7 SPACE PIRATE: save deleted":""),body:i+(e?`

You knew the deal.`:`

Nobody plants the flag on the first try.`),buttons:t})}function Ep(){f.uiOpen||f.over||!f.started||f.mode==="cutscene"||(As(),pi({title:"PAUSED",subtitle:"progress saved. the potatoes are fine. probably.",body:`MOVE <span class="kbd">W A S D</span> \xB7 SPRINT <span class="kbd">SHIFT</span> \xB7 JUMP <span class="kbd">SPACE</span> \xB7 INTERACT <span class="kbd">E</span> (hold)
O2 CANDLE <span class="kbd">X</span> \xB7 EXIT ROVER <span class="kbd">F</span> \xB7 CAMERA <span class="kbd">V</span> \xB7 MAP <span class="kbd">M</span> \xB7 COLONY <span class="kbd">C</span> \xB7 JOURNAL <span class="kbd">J</span>

Survive to Sol ${f.rescueSol}. Watch the six bars. The rover refills your suit;
the Hab refills the rover; the sun refills the Hab. Keep the chain alive.`,buttons:[{label:"RESUME",fn:()=>Ml()},{label:"RESTART RUN",ghost:!0,keep:!0,fn:()=>{to(),Mu()}}]}))}function Sl(i){f.diff=i,f.rescueSol=$n[i].rescueSol,f.drainMult=$n[i].drain,Rp(),A.spawn=J0(Math.random),f.tod=(-(A.spawn.lon+58.4)/360%1+1)%1,Cs(),Sv(),O.q.copy(A.hab.quaternion),Vr(O.q,.3,.9,85,12e3),ji(),bl(O.q,Tp(O.pos,A.hab.position,O.q)),O.alt=0,ji(),f.started=!0,Ml(),Te.wind(.2),Ne("Suit O2 at 46% and leaking. The Hab is that way. RUN.","sys");let e=`lat ${A.spawn.lat.toFixed(1)}\xB0, lon ${A.spawn.lon.toFixed(1)}\xB0E \u2014 ${iu(A.spawn.v)}`;setTimeout(()=>Ne(`Crash site logged: ${e}. Somewhere on Mars. Emphasis on "somewhere."`),5500),Ki()}function Ap(i){f.diff=i.diff||"survival",f.rescueSol=$n[f.diff].rescueSol,f.drainMult=$n[f.diff].drain,A.spawn={lat:i.spawn.lat,lon:i.spawn.lon,v:kt(i.spawn.lat,i.spawn.lon)},Sv(),Rp(),xl(i),f.started=!0,Wr.checkpoint=i,Ml(),Te.wind(.2),Ne(`Sol ${f.sol}. Still here. Still farming. Still winning, technically.`),i.migrated&&i.migrated.includes("terrain")&&setTimeout(()=>Ne("Survey update: the planet is now built from real orbital elevation data. Same Mars, truer ground \u2014 your colony has been re-seated on it.","nasa"),2500)}var yv=!1;function Sv(){yv||(yv=!0,ev(A.spawn),$0(A.spawn),gl(Ce.copy(A.rover.group.position).normalize(),.8),nv())}function Mv(){let i=wp(),e=[];i&&e.push({label:`\u25B6 CONTINUE \u2014 SOL ${i.sol}`,fn:()=>{Te.init(),Te.resume(),Ap(i)}}),e.push({label:i?"NEW GAME (new random site)":"\u25B6 CLICK TO SUIT UP",ghost:!!i,keep:!0,fn:()=>{Te.init(),Te.resume(),$w()}}),pi({title:"STRANDED II",subtitle:"the whole planet. all of it. against you.",body:`The storm hit. The crew evac'd. Your bio-monitor said you were dead.
It exaggerated. You are stranded <b>somewhere on Mars</b> \u2014 a real Mars:
Olympus Mons, Valles Marineris, both ice caps, and every probe humanity
ever threw at this planet, rusting exactly where history left it.

Grow food. Make water. Salvage the dead landers. Find Pathfinder in
Ares Vallis. Call home. Then drive to Schiaparelli crater and fly out.

MOVE <span class="kbd">W A S D</span> \xB7 SPRINT <span class="kbd">SHIFT</span> \xB7 INTERACT <span class="kbd">E</span> hold \xB7 MAP <span class="kbd">M</span> \xB7 COLONY <span class="kbd">C</span> \xB7 JOURNAL <span class="kbd">J</span>`+(fv()?`

<b>A saved game was found, but it is from a version this build cannot read, so it cannot be continued.</b>`:""),buttons:e})}function $w(){let i=e=>({label:$n[e].name,ghost:e!=="survival",fn:()=>Sl(e)});pi({title:"CHOOSE YOUR MARS",body:Object.keys($n).map(e=>`<b>${$n[e].name}</b>
${$n[e].desc}`).join(`

`),buttons:[i("story"),i("survival"),i("iron")]})}var wl={1:"Log, Sol 1. Storm hit. Crew evac'd. An antenna went through my bio-monitor, so the suit told everyone I was dead. Surprise: I'm not. I'm just... alone. On a planet.",2:"Sol 2. Did the math. Rations won't last to rescue. I'm going to have to science the sh*t out of this.",3:"Sol 3. Today's agenda: farming. On a planet where nothing grows. I am the greatest botanist on this planet.",4:"Sol 4. Fun fact: humanity has been littering Mars with robots since 1971. One of them can call home.",5:"Sol 5. Weather report: dust, followed by dust, with a chance of dust.",6:"Sol 6. The potatoes sprouted. I cried a little. Don't tell the potatoes.",7:"Sol 7. Something feels off today. On Mars, 'probably nothing' has a body count.",8:"Sol 8. Every day this planet tries to kill me, and every day I make it breakfast instead.",9:"Sol 9. More weather. My solar panels would like a word with this planet's management.",10:"Sol 10. Ten sols. The Hab smells like soil and victory. Mostly soil.",12:"Sol 12. Update: still the only person on an entire planet. The commute is unbeatable, though.",15:"Sol 15. I named a rock today. His name is Greg. This is fine.",20:"Sol 20. Told Greg about the potatoes. He was nonjudgmental, as usual.",25:"Sol 25. Halfway-ish. The potatoes and I have an understanding: I water them, they keep me alive, nobody mentions the eating part.",30:"Sol 30. I've driven further on Mars than I ever commuted on Earth. Insurance would NOT cover this.",35:"Sol 35. Mars sunsets are blue. The universe has a sense of irony and excellent taste.",40:"Sol 40. Soon. The word tastes like potatoes. Everything tastes like potatoes.",44:"Sol 44. One more sol. Packing my potato. Singular. It's symbolic.",59:"Sol 59. Tomorrow. Greg the rock is coming with me. Don't tell NASA about the mass budget."};function Cs(){let i=f.tod*Math.PI*2;ce.engine.sunDir.set(Math.cos(i),0,Math.sin(i))}function Tl(){return(((((A.spawn?A.spawn.lon:0)/360+f.tod+.5)%1+1)%1-6/m0)%1+1)%1}function Tv(i){let e=Tl();return f.tod=(f.tod+i)%1,Tl()<e-.5}function qr(){return jh.copy(ce.engine.camera.position).normalize().dot(ce.engine.sunDir)}function Su(i,e){let t=Math.abs(Math.asin(ye(i.y,-1,1))/bs);return Math.round(-63+85*Math.max(0,e)-35*Math.pow(t/90,2)-(e<0?22:0))}var Cp={};function jr(i,e,t,n){e<=t&&!Cp[i]?(Cp[i]=!0,Ne(n,"sys"),Te.bad()):e>t+8&&(Cp[i]=!1)}function Zw(){let i=0;for(let t of A.panels)i+=1-ye(t.dust,0,1);let e=i/A.panels.length;for(let t of A.builtMeshes)t.kind==="solar"&&it(t.group.position,A.hab.position)<150&&(e+=.12);return e}function wv(){return Ce.copy(A.hab.position).normalize().dot(ce.engine.sunDir)}function wu(i,e){let t=f.drainMult,n=(e?.5:1)*t,s=Pe.solLen,r=ye(wv()*3,0,1),a=qr(),o=Ev(A.hab.position),l=Pe.solarGen/s*r*Zw()*nt(1,Pe.stormGenMult,o),c=Pe.powerBase*(f.upgrades.insulation?.7:1);Su(Ce.copy(A.hab.position).normalize(),wv())<-70&&!f.upgrades.rtg&&(c+=8);let u=f.upgrades.rtg?6/s:0;f.power=ye(f.power+(l+u-c/s*n)*i,0,Pe.powerMax);let d=f.power>.5,p=f.upgrades.wiper?.3:1,g=nt(Pe.dustRate,Pe.stormDustRate,o)/s*p*i;for(let y of A.panels)y.dust=ye(y.dust+g,0,1);let _=-(Pe.o2Drain/s)*n;if(d&&(_+=Pe.o2Gen/s),f.breach.active&&(_-=Pe.o2BreachDrain/s),f.o2=ye(f.o2+_*i,0,100),e)f.suit=Zt();else{if(f.mode==="rover"){if(f.suit<Zt()&&f.roverO2>0){let y=Math.min(25*i,Zt()-f.suit,f.roverO2);f.suit+=y,f.roverO2-=y}it(A.rover.group.position,A.hab.position)<60&&f.o2>30&&(f.roverO2=ye(f.roverO2+10*i,0,Pe.roverO2Cap))}else if(f.inside&&f.o2>3)f.suit=ye(f.suit+26*i,0,Zt());else{let R=Eu().mag>.12?Au()?.95:.62:.34;f.inside&&(R=.3),f.upgrades.recycler&&(R*=.75),f.flags.coldOpen&&(R*=1.9),Su(Rv(),a)<-85&&(R*=1.25),f.suit=ye(f.suit-R*t*i,0,Zt())}it(A.rover.group.position,A.hab.position)<60&&f.power>10&&(f.roverPower=ye(f.roverPower+Pe.roverChargeAtHab/60*i,0,Zs()));for(let y of A.builtMeshes)y.kind==="solar"&&it(y.group.position,A.rover.group.position)<25&&(f.roverPower=ye(f.roverPower+8/60*Math.max(0,a)*i,0,Zs()))}let v=-(Pe.waterDrain/s)*n;d&&(v+=Pe.waterRecl/s*(f.upgrades.recycler,1)),f.water=ye(f.water+v*i,0,Pe.waterMax);let m=i/s;for(let y of A.plots)y.state==="growing"&&(y.growth>=.5&&y.watered<Pe.waterings||(y.growth+=m/Pe.growSols,y.growth>=1?(y.growth=1,y.state="ready",e||(Te.ok(),Ne("A plot is ready. Potato o'clock.","sys")),Gr(y)):Math.random()<i*.06&&Gr(y)));let x=0;f.water<=0&&(x+=Pe.starveDrain/s),f.food+f.potatoes<=0&&(x+=Pe.starveDrain/s);let S=f.suit<=0&&!(f.inside&&f.o2>3)&&f.mode!=="rover"&&!e;if(S&&(x+=Pe.suffocateDrain),f.inside&&f.o2<=0&&f.suit<=0&&(x+=Pe.suffocateDrain),f.mode==="rover"&&f.roverO2<=0&&f.suit<=0&&(x+=Pe.suffocateDrain),x>0?f.health=ye(f.health-x*t*i,0,Pe.healthMax):f.water>5&&f.food+f.potatoes>0&&(f.health=ye(f.health+Pe.healRegen/s*n*i,0,Pe.healthMax)),e||(jr("suit",f.suit,Zt()*.25,"Suit O2 at 25%. Head for air. Now-ish."),jr("suit2",f.suit,Zt()*.1,"SUIT O2 CRITICAL. RUN."),jr("o2",f.o2,25,"Hab O2 low. Oxygenator needs power. Panels need wiping. You see where this is going."),jr("water",f.water,10,"Water reserves critical. Hydrazine, ice, or thirst \u2014 pick one."),jr("power",f.power,15,"Hab battery low. Life support idles at zero. Wipe the panels."),jr("rpow",f.roverPower,20,"Rover battery low. It solar-trickles when parked in daylight."),jr("health",f.health,40,"Vitals degrading. Eat. Drink. Sleep. In any order."),f.suit<=12||f.o2<=10?f.flags.closeCall||(f.flags.closeCall=!0,f.stats.closeCalls++):f.flags.closeCall=!1),f.health<=0&&!f.over){let y="Mars. The cause is always Mars.";S?y="Asphyxiation, a long way from a door. Mars counts that as a win.":f.inside&&f.o2<=0?y="The Hab ran out of air. The potatoes watched.":f.water<=0?y="Dehydration. On a planet that used to have oceans. Rude.":f.food+f.potatoes<=0&&(y="Starvation. The botany project needed more time."),_v(y)}}function Rp(){f.storm.cells=[];for(let i=0;i<3;i++)f.storm.cells.push({lat:(Yn(i,77,3)*2-1)*55,lon:Yn(i,13,41)*360,r:1800+Yn(i,5,9)*2600,drift:20+Yn(i,8,2)*30,dir:Yn(i,1,6)*Math.PI*2,peak:.7+Yn(i,3,3)*.3})}var Ps=new C;function Pp(i,e){return kt(i.lat,i.lon,e)}function Ev(i){let e=0;Ge.copy(i).normalize();for(let t of f.storm.cells){Pp(t,Ps);let n=Mn(Ge.x,Ge.y,Ge.z,Ps.x,Ps.y,Ps.z)*12e3;n<t.r&&(e=Math.max(e,t.peak*xs(1,.35,n/t.r)))}if((f.sol===5||f.sol===9)&&Tl()>.12&&Tl()<.5){let t=it(i,A.hab.position);t<4e3&&(e=Math.max(e,.85*xs(4e3,1200,t)))}return e}function Av(i){for(let e of f.storm.cells){let t=e.drift*i,n=Pp(e,Ps);hi(n,di,Vi),n.addScaledVector(di,Math.cos(e.dir)*t/12e3).addScaledVector(Vi,Math.sin(e.dir)*t/12e3).normalize();let s=Jn(n);e.lat=s.lat,e.lon=s.lon,e.dir+=(Yn(Math.floor(f.sol*7),Math.floor(e.lon),3)-.5)*i*2}}function Ip(i){let e=i/Pe.solLen,t=Tv(e);Av(e),t&&Tu();let n=Ev(f.mode==="rover"?A.rover.group.position:O.pos);if(f.storm.i=ye(f.storm.i+Math.sign(n-f.storm.i)*i*.12,0,Math.max(n,f.storm.i-i*.12)),f.storm.i>.4&&!f.inside&&f.mode==="walk"&&(f.stats.stormOut+=i),f.sol>=7&&Tl()>.08&&!f.breach.done&&!f.breach.active&&it(f.mode==="rover"?A.rover.group.position:O.pos,A.hab.position)<800&&!f.flags.coldOpen&&f.mode!=="cutscene"&&(f.breach.active=!0,f.breach.timer=0,f.shake=1.4,cl("rgba(255,255,255,0.5)",200),Te.boom(),Te.alarm(!0),An(),Ne("BREACH. The Hab canvas just blew. Air's screaming out. MOVE, WATNEY.","sys")),f.breach.active&&(f.breach.timer+=i,f.breach.timer>90&&!f.breach.cropsKilled)){f.breach.cropsKilled=!0;let s=0;for(let r of A.plots)r.state==="growing"&&(r.state="dead",s++,Gr(r));s&&Ne("The cold got in. The growing crops are dead. Ready trays survived. Small mercies.","sys")}}function Tu(){if(f.sol++,f.potatoes>0?f.potatoes--:f.food>0?f.food--:Ne("No breakfast. The stomach files a formal complaint.","sys"),wl[f.sol]&&setTimeout(()=>Ne(wl[f.sol]),1200),f.sol===4&&!f.flags.pfRevealed){f.flags.pfRevealed=!0;let i=it(O.pos,A.pathfinder.position);setTimeout(()=>Ne(`Found it in the charts: Pathfinder, dead since '97, ${ui(i)} from here in Ares Vallis. If I fetch it, I can call Earth. Road trip.`),6e3),f.flags.routePods||(f.flags.routePods=!0,Qw())}if(f.sol>=f.rescueSol&&!f.flags.mavRevealed&&Lp(),f.pf.connected||f.diff==="story"){for(let i of f.storm.cells)if(Pp(i,Ps),Mn(Ps.x,Ps.y,Ps.z,Ge.copy(A.hab.position).normalize().x,Ge.y,Ge.z)*12e3<i.r+2500){setTimeout(()=>Ne("Forecast: a dust cell is drifting near the colony. Panels will hate it.","nasa"),5e3);break}}(f.sol===5||f.sol===9)&&setTimeout(()=>Ne("Sky's going brown at the horizon. Storm day. Wonderful.","sys"),3e3),Ki(),As()}function Qw(){let i=it(A.hab.position,A.pathfinder.position);if(i<6e3)return;let e=Math.min(3,Math.floor(i/6e3)+1);Ce.copy(A.hab.position).normalize(),Ve.copy(A.pathfinder.position).normalize();for(let t=1;t<=e;t++){let n=t/(e+1);Ge.copy(Ce).lerp(Ve,n).normalize(),ul(Xi(Ge,void 0,t*2.1),{rations:2,water:10,candle:1,scrap:1},"Open NASA route cache")}setTimeout(()=>Ne(`NASA pre-dropped ${e} supply caches along the Pathfinder route. They appear on the map. Somebody up there likes me.`,"nasa"),9e3)}function Lp(){f.flags.mavRevealed=!0;let i=ui(it(O.pos,A.mav.position));f.pf.connected?Ne(`Launch window is OPEN. The Ares 4 MAV is fueled and waiting in Schiaparelli crater \u2014 ${i} out. Time to fly a convertible.`,"nasa"):Ne(`Sol ${f.rescueSol}. NASA's original plan had the Ares 4 MAV launching from Schiaparelli about now \u2014 ${i} away. That rocket is my ride, phone call or no phone call.`),Te.jingle()}function El(i){if(f.sleeping)return;f.sleeping=!0;let e={o2:f.o2,water:f.water,power:f.power,potatoes:f.potatoes,food:f.food};Z.overlay.style.display="flex",f.uiOpen=!0,Z.panel.innerHTML='<h2 style="margin-bottom:8px">SLEEPING\u2026</h2><div class="bd" id="mg-sleepbd" style="min-height:120px"></div>';let t=Ce.copy(i?A.rover.group.position:O.pos).normalize().clone(),n=0,s=!1,r=Pe.solLen/40,a=t.dot(ce.engine.sunDir);for(let u=0;u<60;u++){let d=Tv(r/Pe.solLen);if(Av(r/Pe.solLen),d&&(Tu(),s=!0),wu(r,!0),f.over){f.sleeping=!1;return}n+=r,Cs();let p=t.dot(ce.engine.sunDir);if(n>Pe.solLen*.1&&a<.03&&p>=.03||(a=p,n>Pe.solLen*1.3))break}if(f.over){f.sleeping=!1;return}let o=document.getElementById("mg-sleepbd"),l=(u,d,p)=>{let g=d-u;return`<span style="color:${g>=0?"#7fca7f":"#ff8f7f"}">${g>=0?"+":""}${g.toFixed(1)}${p}</span>`},c=A.plots.filter(u=>u.state==="growing").length,h=A.plots.filter(u=>u.state==="ready").length;setTimeout(()=>{o&&!f.over&&(o.innerHTML=`HAB O2 ${l(e.o2,f.o2,"%")} \xB7 H2O ${l(e.water,f.water,"L")} \xB7 PWR ${l(e.power,f.power,"%")}
Breakfast: ${f.potatoes<e.potatoes?"potato. again.":f.food<e.food?"1 ration":"skipped"}
`+(c+h>0?`Farm: ${c} growing, ${h} ready
`:"")+(i?`Slept curled around the driver seat. The chiropractor is 225 million km away.
`:"")+`
<b style="font-size:22px;letter-spacing:4px">SOL ${f.sol}</b>`)},500),setTimeout(()=>{if(f.over){f.sleeping=!1;return}Br(),f.sleeping=!1,f.health=ye(f.health+Pe.sleepHeal,0,Pe.healthMax),An(),Ki(),As()},2900)}function Cv(){f.pf.connected=!0,An(),Te.jingle(),Ki();let i=ui(it(A.hab.position,A.mav.position)),e=[["n","MARK? MARK, IS THAT YOU? \u2014 JPL. We're receiving Pathfinder telemetry. The whole world is watching, Mark."],["w","Alive and well. Ish. Growing potatoes on a dead planet. Air holds, food's tight, morale is potato-based."],["n",`Copy. New plan: Ares 4's MAV is fueled and standing in Schiaparelli crater, ${i} from your position. Hermes swings back for a Sol ${f.rescueSol} intercept. Survive, drive, launch. We'll be there.`],["w",`So the plan is "don't die for ${Math.max(0,f.rescueSol-f.sol)} more sols, then drive ${i} and ride a rocket somebody else parked." I've had worse weekends.`],["n","We're also uploading survey tasks \u2014 old landers with parts worth salvaging. Help us close some files, we drop supplies. And Mark: everything you type is broadcast live on Earth. Language."],["w","Acknowledged. [REDACTED BY NASA]. [ALSO REDACTED]. Boy, am I glad you warned me."]],t=0,n=()=>{if(t>=e.length){Br(),Ne("Uplink holds. Earth is one very slow text message away.","nasa"),e1(),f.sol>=f.rescueSol&&Lp(),Ki(),As();return}let s=e.slice(0,t+1).map(([r,a])=>`<div style="margin-bottom:10px"><span class="${r==="n"?"n":"w"}">${r==="n"?"[HOUSTON]":"[WATNEY]"}</span> ${a}</div>`).join("");pi({title:"PATHFINDER UPLINK",subtitle:"signal delay: 11 minutes, mercifully compressed",body:`<div class="comms">${s}</div>`,buttons:[{label:t<e.length-1?"NEXT \u25B8":"CLOSE CHANNEL",keep:t<e.length-1,fn:()=>{t++,Te.click(),n()}}]}),t===0&&Te.ok()};n(),Ne("IT TALKS. Pathfinder lives. Hello, Earth. Did you miss me?"),Al("pf-connected",""),Ci()}var Xr=[{id:"viking1",name:"Viking Funeral",target:"Viking 1",desc:"Salvage Viking 1 (1976) in Chryse Planitia. NASA wants a photo. And the descent-stage hydrazine.",ev:["salvage","Viking 1"],loot:{scrap:4,rations:2,hydrazine:1}},{id:"spirit",name:"Wake the Dead",target:"Spirit",desc:"Recover Spirit's memory boards at Gusev crater. She earned a proper goodbye.",ev:["salvage","Spirit"],loot:{rations:3,candle:1},bp:"recycler"},{id:"oppy",name:"Oppy's Last Message",target:"Opportunity",desc:"Find Opportunity in Meridiani Planum and wipe her panels. Yes, it matters. To everyone.",ev:["salvage","Opportunity"],loot:{rations:4,circuit:1},bp:"drive2"},{id:"insight",name:"Marsquake",target:"InSight",desc:"Retrieve InSight's seismometer data from Elysium Planitia. 1300 marsquakes are waiting.",ev:["salvage","InSight"],loot:{scrap:2,candle:1},reveal:!0},{id:"phoenix",name:"Polar Express",target:"Phoenix",desc:"Reach Phoenix at the edge of the northern ice. Pack warm. Pack O2. Pack more O2.",ev:["salvage","Phoenix"],loot:{rations:4,hydrazine:2},bp:"tank2"},{id:"mars3",name:"Sirens of Mars",target:"Mars 3",desc:"Find Mars 3, silent since 1971, and recover its film canister. The first one deserves a visitor.",ev:["salvage","Mars 3"],loot:{scrap:5,rations:5,circuit:1}},{id:"breadcrumbs",name:"Breadcrumbs",target:null,desc:"Pre-position the escape: deploy an O2 Cache and a Nav Beacon at least 2 km from the Hab, toward Schiaparelli.",ev:["deploy",null],loot:{rations:3,candle:2}}];function Rs(i){if(i.target){let e=A.landers.find(t=>t.data.name===i.target);return e?e.group.position:null}return null}function e1(){for(let i of Xr)f.quests[i.id]||(f.quests[i.id]="active");for(let i of Object.keys(f.salvaged))Al("salvage",i);Ne("NASA uploaded survey tasks \u2014 old landers with parts worth saving. Check the journal [J]. They pay in supply pods.","nasa"),up({scrap:3,rations:3,candle:1},"Open NASA care package").blueprint="drill"}function Al(i,e){for(let t of Xr){if(f.quests[t.id]!=="active")continue;let n=!1;if(t.ev[0]==="salvage"&&i==="salvage"&&t.ev[1]===e&&(n=!0),t.id==="breadcrumbs"&&i==="deploy"){let r=!1,a=!1;for(let o of A.builtMeshes){let l=it(o.group.position,A.hab.position);l>2e3&&o.kind==="cache"&&(r=!0),l>2e3&&o.kind==="beacon"&&(a=!0)}n=r&&a}if(!n)continue;f.quests[t.id]="done",Te.discovery();let s=up(t.loot,`Open "${t.name}" reward pod`);t.bp&&(s.blueprint=t.bp),t.reveal&&(f.flags.mapRevealed=!0,Ne("InSight's data came with NASA's full survey map. Every landmark, revealed. [M]","nasa")),Ne(`Survey task complete: ${t.name}. NASA is sending a pod.`,"nasa")}}function Ru(i,e,t){f.discovered[i]||(f.discovered[i]=!0,f.stats.discoveries++,Te.discovery(),ll(t?"SITE DISCOVERED":"REGION DISCOVERED",i.toUpperCase(),e||""),Ci())}var Dp=0;function Pv(i){if(Dp+=i,Dp<1.5)return;Dp=0;let e=f.mode==="rover"?A.rover.group.position:O.pos;Ce.copy(e).normalize();for(let t of A.landers)f.discovered[t.data.name]||it(e,t.group.position)<160&&Ru(t.data.name,t.data.note,!0);for(let t of er)t.type==="bulge"||t.type==="albedo"||f.discovered[t.name]||Mn(Ce.x,Ce.y,Ce.z,t.v.x,t.v.y,t.v.z)<t.angR&&Ru(t.name,t.note,!1)}var Cu=[{id:"notdead",name:"Not Dead Yet",desc:"Reach the dawn of Sol 2",check:()=>f.sol>=2},{id:"phone",name:"Phone Home",desc:"Restore the Pathfinder uplink",check:()=>f.pf.connected},{id:"botanist",name:"Greatest Botanist on This Planet",desc:"Harvest 50 potatoes",check:()=>f.stats.potatoes>=50},{id:"eyebrows",name:"Both Eyebrows",desc:"Five hydrazine burns survived",check:()=>f.stats.booms>=5},{id:"arch",name:"Archaeologist of the Future",desc:"Salvage 8 historic landers",check:()=>Object.keys(f.salvaged).length>=8},{id:"olympus",name:"Peak Performance",desc:"Stand on the summit of Olympus Mons",check:()=>{let i=er.find(e=>e.name==="Olympus Mons");return Ve.copy(O.pos).normalize(),Mn(Ve.x,Ve.y,Ve.z,i.v.x,i.v.y,i.v.z)*12e3<120}},{id:"hellas",name:"The Bottom of Everything",desc:"Stand on the floor of Hellas Planitia",check:()=>{let i=er.find(e=>e.name==="Hellas Planitia");return Ve.copy(O.pos).normalize(),Mn(Ve.x,Ve.y,Ve.z,i.v.x,i.v.y,i.v.z)*12e3<800}},{id:"circum",name:"Circumnavigator",desc:"Drive 75.4 km \u2014 one full lap of Mars",check:()=>f.stats.driven>=75400},{id:"ice",name:"Ice to Meet You",desc:"Mine 25 ice chunks",check:()=>f.stats.mined>=25},{id:"storm",name:"Storm Rider",desc:"Spend 60 seconds outside in a dust storm",check:()=>f.stats.stormOut>=60},{id:"marathon",name:"Ares Marathon",desc:"Walk 10 km on foot",check:()=>f.stats.walked>=1e4},{id:"disco",name:"Disco Inferno",desc:"Endure 3 minutes of Lewis's playlist",check:()=>f.stats.discoTime>=180},{id:"pirate",name:"Space Pirate",desc:"Leave Mars",check:()=>f.won}];function Ci(){for(let i of Cu){if(f.achieved[i.id])continue;let e=!1;try{e=i.check()}catch{}e&&(f.achieved[i.id]=!0,Te.discovery(),ll("ACHIEVEMENT",i.name,i.desc))}}var Kr=null;function Iv(){f.mode="cutscene",f.uiOpen=!1,Z.prompt.style.display="none",Is();let i=Ce.copy(A.mav.position).normalize().clone();hi(i,di,Vi);let e=A.mav.position.clone().addScaledVector(di,-26).addScaledVector(Vi,20);if(e.normalize().multiplyScalar(At(e)+2.2),Ne("Strapped into a rocket with no nose cone under a tarp. Countdown started. If this works, drinks are on NASA forever."),f.pf.connected&&(f.disco=!0,Te.disco(!0),setTimeout(()=>Ne("The playlist synced to the MAV. I'm launching to disco. This is my life now.","nasa"),3500)),[3,2,1].forEach((r,a)=>setTimeout(()=>{Te.beep(700+r*60,.18,"square",.15),Ne(`${r}...`,"nasa")},2e3+a*1e3)),!Kr){let r=Zn("hermes");Kr=r.root,A.hermesRing=r.part("ring"),Kr.scale.setScalar(30),ce.world.add(Kr)}Kr.position.copy(i).multiplyScalar(12e3*1.85).addScaledVector(di,12e3*.8);let t=5.2,n=0,s=0;A.launchAnim=r=>{if(n+=r,n<=t){ce.engine.camera.position.copy(e),ar(Ve.copy(A.mav.position).addScaledVector(i,8),i);return}let a=n-t;A.mavFlame.visible=!0,Te.rumble(ye(a*.5,0,.85)),s=a*a*14,A.mavRocket.position.y=A.mavRocketY+s,A.mavFlame.scale.y=1+Math.random()*.4;let o=Ve.copy(A.mav.position).addScaledVector(i,s+8);if(s<2200)ce.engine.camera.position.copy(e).addScaledVector(i,s*.55),f.shake=ye(1-a*.06,0,1),ce.engine.camera.position.addScaledVector(Ge.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.5),ar(o,i);else{let l=xs(2200,14e3,s);Ge.copy(i).multiplyScalar(12e3*(1.15+l*1.3)).addScaledVector(di,12e3*.55*l),ce.engine.camera.position.lerp(Ge,1-Math.pow(.02,r)),ar(l>.6?Kr.position:o,i),Te.rumble(ye(1-l,.1,.85))}s>8e3&&Kr.position.lerp(Ve.copy(i).multiplyScalar(12e3*1.85),1-Math.pow(.3,r)),s>15500&&!f.won&&t1()}}function t1(){f.won=!0,Te.rumble(0),Te.jingle(),Ci(),setTimeout(()=>Te.disco(!1),6e3),to();let i=f.stats;pi({title:"RESCUED",subtitle:`HERMES INTERCEPT CONFIRMED \xB7 SOL ${f.sol} \xB7 ${$n[f.diff].name}`,body:`<b>Watney is off the surface.</b>

Sols survived: ${f.sol}
Potatoes farmed: ${i.potatoes}
Driven: ${(i.driven/1e3).toFixed(1)} km \xB7 Walked: ${(i.walked/1e3).toFixed(1)} km
Landmarks discovered: ${i.discoveries} \xB7 Landers salvaged: ${Object.keys(f.salvaged).length}
Achievements: ${Object.keys(f.achieved).length}/${Cu.length}
Close calls: ${i.closeCalls} \xB7 Indoor explosions: ${i.booms}

"Every human being has a basic instinct to help each other out.
If a hiker gets lost, people organize a search party. This is why
they came back for me." \u2014 M. Watney, space pirate, greatest botanist
on two planets.`,buttons:[{label:"PLAY AGAIN (new random site)",keep:!0,fn:()=>Mu()}]})}function Gr(i){i.soilMesh.visible=i.state!=="empty";let e=.25+i.growth*1.05;if(i.plantsDead){i.plants.visible=i.state==="growing"||i.state==="ready",i.plantsDead.visible=i.state==="dead";let t=Math.min(1,.25+i.growth*.75);i.plants.scale.set(t,t,t);return}i.plants.visible=i.state==="growing"||i.state==="ready"||i.state==="dead",i.plants.scale.set(e,e,e),i.plants.traverse(t=>{t.material&&(i.state==="dead"?t.material.color.set(5917232):i.state==="ready"?t.material.color.set(t.geometry.type==="SphereGeometry"?7782474:5147194):t.material.color.set(t.geometry.type==="SphereGeometry"?5151290:4160047))})}function _l(){return A.plots.filter(i=>i.state==="growing"||i.state==="ready").length}function Pu(){let i=null,e=2.2;for(let t of A.plots){if(!t.worldPos)continue;let n=it(O.pos,t.worldPos);n<e&&(e=n,i=t)}return i}Rt({pos:()=>{let i=Pu();return i?i.worldPos:null},r:2.2,hold:1.3,mode:"walk",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>{let i=Pu();if(!i)return!1;switch(i.state){case"empty":return f.inv.regolith>0?!0:"Needs soil \u2014 dig regolith outside";case"soil":return f.food+f.potatoes>0?f.water>=Pe.waterPerDose?!0:"Not enough water (5L)":"No seed potato left";case"growing":return i.watered<Pe.waterings&&i.growth>=.42?f.water>=Pe.waterPerDose?!0:"Not enough water (5L)":`Growing \u2014 ${Math.round(i.growth*100)}%`;case"ready":case"dead":return!0}return!1},label:()=>{let i=Pu();if(!i)return"";switch(i.state){case"empty":return"Fill bed with regolith";case"soil":return`Plant seed potato (1 ${f.potatoes>0?"potato":"ration"}, 5L water)`;case"growing":return"Water the plants (5L)";case"ready":return"Harvest potatoes";case"dead":return"Clear out the dead crop"}return""},use:()=>{let i=Pu();if(i){switch(i.state){case"empty":f.inv.regolith--,i.state="soil";break;case"soil":f.potatoes>0?f.potatoes--:f.food--,f.water-=Pe.waterPerDose,i.state="growing",i.growth=.04,i.watered=1,_l()===1&&Ne("Planted. Grow, little guy. No pressure, but you're the food supply.");break;case"growing":f.water-=Pe.waterPerDose,i.watered++;break;case"ready":i.state="soil",i.growth=0,i.watered=0,f.potatoes+=Pe.potatoYield,f.stats.potatoes+=Pe.potatoYield,Te.jingle(),f.stats.potatoes===Pe.potatoYield&&Ne("First harvest. I am the greatest botanist on this planet. Fear me."),Ci();break;case"dead":i.state="soil",i.growth=0,i.watered=0;break}Te.ok(),Gr(i)}}});Rt({pos:()=>on(A.hab,0,0,Qn+1.6,Ve),r:3.4,hold:2.2,mode:"walk",visible:()=>f.flags.coldOpen,label:()=>"Pull the antenna. Seal the suit.",use:()=>{f.flags.coldOpen=!1,f.flags.suitSealed=!0,f.suit=Zt(),f.shake=1.2,cl("rgba(255,60,40,0.35)",350),Te.boom(),setTimeout(()=>Te.ok(),600),setTimeout(()=>Ne("Suit resealed. O2 refilling. Ow. OW. Okay. Inventory time.","sys"),300),setTimeout(()=>Ne(wl[1]),1e3)}});function Fv(i,e,t,n,s){Rt({pos:()=>on(A.hab,e,0,t,Ve),r:2.6,hold:.7,mode:"walk",pose:"stand",visible:()=>f.started&&!f.flags.coldOpen&&!f.checkedSystems[i],label:()=>`Inspect the ${n}`,use:()=>{f.checkedSystems[i]=!0,Te.ok(),Ne(s)}})}Fv("oxy",5.6,-3.6,"oxygenator","Oxygenator: alive. It eats CO2 and power, makes air. My favorite roommate.");Fv("rec",5.9,-.4,"water reclaimer","Water reclaimer: functional. Yes, it recycles what you think it recycles. No, we don't discuss it.");function Iu(i,e,t,n){let s=null,r=t;for(let a of i){if(n&&!n(a))continue;let o=it(O.pos,e(a));o<r&&(r=o,s=a)}return s}function Lv(i){return Ge.copy(i.group.position).applyQuaternion(A.solarGroup.quaternion).add(A.solarGroup.position)}Rt({pos:()=>{let i=Iu(A.panels,Lv,3);return i?Lv(A._activePanel=i):null},r:3,hold:1.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,enabled:()=>A._activePanel&&A._activePanel.dust>.06?!0:"Panel is clean",label:()=>`Wipe solar panel (${Math.round((1-(A._activePanel?A._activePanel.dust:0))*100)}% output)`,use:()=>{let i=A._activePanel;i&&(i.dust=0,f.stats.panels++,An(),Te.ok(),f.stats.panels===1&&Ne("Wiped a panel. Immediately covered in dust myself. The circle of Mars."))}});Rt({pos:()=>{let i=Iu(A.soilPiles,e=>e.group.position,2.8,e=>e.left>0);return i?(A._activePile=i).group.position:null},r:2.8,hold:1.4,mode:"walk",visible:()=>!f.flags.coldOpen,label:()=>"Dig regolith (+1)",use:()=>{let i=A._activePile;!i||i.left<=0||(i.left--,f.inv.regolith++,An(),Te.pickup())}});Rt({pos:()=>O.pos,r:99,hold:2.6,mode:"walk",priority:9,visible:()=>!f.flags.coldOpen&&!f.inside&&f.flags.didMath,label:()=>"Dig regolith here (+1, slow)",use:()=>{f.inv.regolith++,Te.pickup()}});Rt({pos:()=>on(A.hab,5.5,0,2.6,Ve),r:2.4,hold:2,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.hydrazine>0?!0:"Hydrazine tank is empty",label:()=>`Burn hydrazine for water (+${Pe.hydrazineWater}L) \u2014 ${f.hydrazine} left`,use:()=>{f.hydrazine--,f.water=ye(f.water+Pe.hydrazineWater,0,Pe.waterMax),A.hydFlame.visible=!0,setTimeout(()=>{A.hydFlame.visible=!1},2600),f.flags.hydrazineBoom?(f.stats.booms++,Te.ok(),Ne(`+${Pe.hydrazineWater}L water. Eyebrow count stable. Progress.`),Ci()):(f.flags.hydrazineBoom=!0,f.stats.booms++,setTimeout(()=>{f.shake=1.6,f.o2=ye(f.o2-7,0,100),cl("rgba(255,180,80,0.75)",500),Te.boom(),Ne("So. Small fireball. Eyebrows: gone. Water: acquired. Science!")},1200),Ne("Burning rocket fuel indoors. What could possibly go wrong?"))}});Rt({pos:()=>on(A.hab,-5,0,-4.9,Ve),r:2.3,hold:1.2,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.breach.active?"Not with the Hab screaming, no":qr()>.25?"Too much daylight to waste":!0,label:()=>"Sleep until dawn",use:()=>El(!1)});Rt({pos:()=>on(A.hab,4.2,0,4.8,Ve),r:2.2,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,enabled:()=>f.health>92?"Not hungry right now":f.potatoes>0||f.food>0?!0:"The shelf is bare",label:()=>`Eat a ${f.potatoes>0?"potato. Again.":"ration"} (+12 vitals)`,use:()=>{f.potatoes>0?f.potatoes--:f.food--,f.health=ye(f.health+12,0,Pe.healthMax),Te.ok()}});Rt({pos:()=>on(A.hab,0,0,-6.6,Ve),r:2.4,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&!f.flags.didMath,label:()=>"Run the numbers",use:()=>{f.flags.didMath=!0,Te.ok(),Ne(`${f.food} rations. Rescue window: Sol ${f.rescueSol}. The math says: farm or starve. I'm going to have to science the sh*t out of this.`)}});Rt({pos:()=>on(A.hab,-.9,0,-6.4,Ve),r:2.2,hold:.8,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&f.pf.connected,label:()=>"Message NASA",use:()=>{let i=["Please tell Commander Lewis her taste in music is a war crime. \u2014 M.W.","Status: alive. Potatoes: thriving. Dignity: pending. \u2014 M.W.","NASA says the whole world is watching. Waved at the sky. Felt weird. Did it again.","Asked NASA for pizza. Received an orbital mechanics refresher. Same thing, apparently.","NASA reminds me everything I type is broadcast live to Earth. So. Hi, Mom."];Te.ok(),Ne(i[(f.flags.nasaMsg=f.flags.nasaMsg+1)%i.length],"nasa")}});Rt({pos:()=>on(A.hab,.9,0,-6.4,Ve),r:2.2,hold:.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside&&f.pf.connected,label:()=>f.disco?"Mercifully stop the disco":"Play Lewis's disco playlist",use:()=>{f.disco=!f.disco,Te.disco(f.disco),Ne(f.disco?"Disco: ON. I hate it. ...It's growing on me. I hate that more.":"Disco: OFF. Blessed silence.")}});Rt({pos:()=>on(A.hab,-4.6,0,3.9,Ve),r:2.4,hold:.5,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&f.inside,label:()=>"Use the fabricator [C]",use:()=>Yr("colony")});Rt({pos:()=>A.rover.group.position,r:3.8,hold:.6,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,label:()=>"Drive the rover",sub:()=>`PWR ${Math.round(f.roverPower)}/${Zs()} \xB7 O2 tank ${Math.round(f.roverO2)}`,use:()=>hv()});Rt({pos:()=>A.rover.group.position,r:1e9,hold:.4,mode:"rover",visible:()=>Math.abs(pt.speed)<1.5&&qr()>=.05,label:()=>"Step out",use:()=>vl()});Rt({pos:()=>A.rover.group.position,r:1e9,hold:2.2,mode:"rover",visible:()=>Math.abs(pt.speed)<1.5&&qr()<.05,label:()=>"Camp in the rover until dawn",sub:()=>"press F to step out instead",use:()=>El(!0)});Rt({pos:()=>A.pathfinder.position,r:5.5,hold:2.6,mode:"walk",visible:()=>f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected,enabled:()=>it(A.rover.group.position,A.pathfinder.position)<20?!0:"Too heavy to carry \u2014 bring the rover closer",label:()=>"Dig out Pathfinder and load it up",use:()=>{f.pf.loaded=!0,f.pf.found=!0,A.pfCollider.r=.001,An(),Te.jingle(),Ne("Hello, little guy. You've been dead since 1997. Let's fix that. Next stop: home.")}});Rt({pos:()=>A.uplink.position,r:5,hold:2.6,mode:"walk",pose:"stand",visible:()=>f.pf.loaded&&!f.pf.connected,enabled:()=>it(A.rover.group.position,A.uplinkRing.position)<9?!0:"Park the rover on the marked ring first",label:()=>"Connect Pathfinder to the uplink",use:()=>Cv()});var Dv={Spirit:3,"Beagle 2":1,InSight:2,Curiosity:1,Zhurong:1,Opportunity:2};Rt({pos:()=>{let i=Iu(A.landers,e=>e.group.position,5,e=>e.data.name!=="Pathfinder"&&!f.salvaged[e.data.name]);return i?(A._activeLander=i).group.position:null},r:5,hold:2.4,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,label:()=>A._activeLander?`Salvage ${A._activeLander.data.name} (${A._activeLander.data.year})`:"",use:()=>{let i=A._activeLander;if(!i||f.salvaged[i.data.name])return;f.salvaged[i.data.name]=!0;let e={scrap:i.data.scrap};Dv[i.data.name]&&(e.circuit=Dv[i.data.name]);let t=bp(e);Ne(`Salvaged ${i.data.name}: ${t}. ${i.data.note}`,"disc"),Ru(i.data.name,i.data.note,!0),Al("salvage",i.data.name),Ci()}});Rt({pos:()=>{let i=Iu(A.iceSites,e=>e.group.position,4.5,e=>e.left>0);return i?(A._activeIce=i).group.position:null},r:4.5,hold:1.6,mode:"walk",visible:()=>!f.flags.coldOpen,enabled:()=>f.upgrades.drill?!0:"Needs the Ice Drill upgrade",label:()=>`Mine water ice (+1, ${A._activeIce?A._activeIce.left:0} left)`,use:()=>{let i=A._activeIce;!i||i.left<=0||(i.left--,f.inv.ice++,f.stats.mined++,_p(i),Te.pickup(),Ci())}});Rt({pos:()=>{let i=null,e=4.5;for(let t of A.pods){if(t.taken)continue;let n=it(O.pos,t.group.position);n<e&&(e=n,i=t)}return i?(A._activePod=i).group.position:null},r:4.5,hold:1.6,mode:"walk",visible:()=>!f.flags.coldOpen,label:()=>A._activePod?A._activePod.label:"",use:()=>{let i=A._activePod;if(!i||i.taken)return;i.taken=!0,yp(i);let e=bp(i.loot);Ne(`Recovered: ${e}.`),i.blueprint&&(f.blueprints[i.blueprint]=!0,Ne(`NASA attached schematics: ${i.blueprint.toUpperCase()} blueprint unlocked.`,"nasa"))}});Rt({pos:()=>A.rtgSite.group.position,r:4,hold:3,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen&&!A.rtgSite.taken&&f.flags.didMath,label:()=>"Dig up the RTG (radioactive. cozy.)",use:()=>{A.rtgSite.taken=!0,An(),f.flags.hasRtg=!0,Te.pickup(),Ne("One RTG: a plutonium space-heater NASA buried out of an abundance of caution. I am strapping it to my life. Socket it at the fabricator.")}});Rt({pos:()=>on(A.hab,0,0,-Qn+1.2,Ve),r:3.2,hold:3,mode:"walk",pose:"stand",visible:()=>f.breach.active&&f.inside,label:()=>"Seal the breach (canvas, tape, prayer)",use:()=>{f.breach.active=!1,f.breach.done=!0,Te.alarm(!1),Te.ok(),f.shake=.5,An(),Ne(f.breach.cropsKilled?"Sealed. Too late for the crops. The Hab and I are no longer on speaking terms.":"Breach sealed. Crops: alive. Heart rate: unpublishable. Duct tape: undefeated.")}});Rt({pos:()=>{let i=null,e=3.5;for(let t of A.builtMeshes){if(t.kind!=="cache"||t.charges<=0)continue;let n=it(O.pos,t.group.position);n<e&&(e=n,i=t)}return i?(A._activeCache=i).group.position:null},r:3.5,hold:1,mode:"walk",pose:"stand",visible:()=>!f.flags.coldOpen,enabled:()=>f.suit<Zt()-5?!0:"Suit is full",label:()=>`Refill suit O2 (${A._activeCache?A._activeCache.charges:0} charges left)`,use:()=>{let i=A._activeCache;!i||i.charges<=0||(i.charges--,f.suit=ye(f.suit+40,0,Zt()),Te.ok())}});var Pi=null;function Nv(i){Pi=i,Is(),Ne("Pick a spot outside and place it.","sys")}Rt({pos:()=>O.pos,r:99,hold:1.6,mode:"walk",priority:2,visible:()=>!!Pi&&!f.inside,label:()=>`Place the ${sr["kit"+Pi.charAt(0).toUpperCase()+Pi.slice(1)]||Pi} here`,use:()=>{let i="kit"+Pi.charAt(0).toUpperCase()+Pi.slice(1);if((f.inv[i]||0)<=0){Pi=null;return}f.inv[i]--;let e=Pi;Ce.copy(O.pos).normalize(),Ve.set(0,0,-1).applyQuaternion(O.q),Ce.addScaledVector(Ve,(e==="greenhouse"?6.4:2.6)/12e3).normalize(),hi(Ce,zn,Hn),au(e,Ce,Math.atan2(-Ve.dot(zn),-Ve.dot(Hn))),Te.craft(),Ne(`${sr[i]} deployed. Mars: 0, engineering: 1.`),An(),Al("deploy",Pi),Pi=null,Ci()}});Rt({pos:()=>A.mav.position,r:8,hold:3,mode:"walk",pose:"stand",visible:()=>f.flags.mavRevealed&&!f.flags.mavStripped,enabled:()=>f.sol>=f.rescueSol?!0:`Launch window opens Sol ${f.rescueSol} \u2014 NASA was firm about this`,label:()=>"Strip excess weight (nose cone, seats, dignity)",use:()=>{f.flags.mavStripped=!0,A.mavNose&&(A.mavNose.visible=!1),Te.ok(),Ne("Removed the nose cone. NASA says the tarp will hold. NASA is lying, and we both know it.")}});Rt({pos:()=>A.mav.position,r:8,hold:1.6,mode:"walk",pose:"stand",visible:()=>f.flags.mavStripped&&!f.won,label:()=>"Climb in. Go home.",use:()=>{pi({title:"LAUNCH?",body:`The MAV is a convertible now. The math says Hermes can catch you.
The math has been wrong before.

No coming back. The potatoes forgive you.`,buttons:[{label:"PUNCH IT",fn:()=>Iv()},{label:"Not yet",ghost:!0,fn:()=>{}}]})}});function En(){return Z.mapScreen.style.display==="block"||Z.colonyScreen.style.display==="block"||Z.journalScreen.style.display==="block"}function Is(){Z.mapScreen.style.display="none",Z.colonyScreen.style.display="none",Z.journalScreen.style.display="none"}for(let i of[Z.mapScreen,Z.colonyScreen,Z.journalScreen]){let e=i.querySelector(".close");e.addEventListener("click",t=>{t.stopPropagation(),Te.click(),Is()}),e.addEventListener("touchstart",t=>{t.preventDefault(),t.stopPropagation(),Te.click(),Is()},{passive:!1})}function Yr(i){let t={map:Z.mapScreen,colony:Z.colonyScreen,journal:Z.journalScreen}[i],n=t.style.display==="block";if(Is(),!n){t.style.display="block";try{document.exitPointerLock&&document.exitPointerLock()}catch{}i==="map"&&Up(),i==="colony"&&Np(),i==="journal"&&n1(),Te.click()}}var Rl=1440,Lu=720;function Fp(i,e){return[(e%360+360)%360/360*Rl,(90-i)/180*Lu]}function Uv(i){let e=Jn(Ce.copy(i).normalize());return Fp(e.lat,e.lon)}function Up(){let i=Z.mapCanvas;i.width=Rl,i.height=Lu,i.style.width="min(100%, 1200px)";let e=i.getContext("2d");ce.mapImage?e.drawImage(ce.mapImage,0,0,Rl,Lu):(e.fillStyle="#5a2d1a",e.fillRect(0,0,Rl,Lu)),e.font="9px monospace",e.fillStyle="rgba(255,230,200,0.75)";for(let n of tu){let[s,r]=Fp(n.lat,n.lon);e.fillText(n.name,s-n.name.length*2.2,r)}for(let n of f.storm.cells){let[s,r]=Fp(n.lat,n.lon);e.beginPath(),e.arc(s,r,n.r/(2*Math.PI*12e3)*Rl,0,Math.PI*2),e.fillStyle="rgba(160,90,40,0.35)",e.fill()}let t=(n,s,r)=>{let[a,o]=Uv(n);e.fillStyle=s,e.fillRect(a-2,o-2,4,4),r&&(e.fillStyle=s,e.fillText(r,a+4,o+3))};for(let n of A.landers)f.discovered[n.data.name]?t(n.group.position,"#9ecfff",n.data.name):f.flags.mapRevealed&&t(n.group.position,"rgba(158,207,255,0.45)","?");for(let n of A.builtMeshes)t(n.group.position,n.kind==="beacon"?"#4fd8ff":"#c0b090",n.kind==="beacon"?"beacon":"");for(let n of A.pods)n.taken||t(n.group.position,"#ffd27f","cache");f.flags.pfRevealed&&!f.pf.loaded&&!f.pf.connected&&t(A.pathfinder.position,"#ffef9e","PATHFINDER"),t(A.mav.position,f.flags.mavRevealed?"#ff7f5f":"rgba(255,127,95,0.5)","ARES 4 MAV"),t(A.hab.position,"#7fff9e","HAB"),t(A.rover.group.position,"#ffb45e","rover");{let[n,s]=Uv(O.pos);e.fillStyle="#ffffff",e.beginPath(),e.arc(n,s,3,0,Math.PI*2),e.fill()}Z.mapScreen.querySelector("#mg-maplegend").innerHTML=`SOL ${f.sol} \xB7 lat ${Jn(Ce.copy(O.pos).normalize()).lat.toFixed(1)}\xB0 lon ${Jn(Ce).lon.toFixed(1)}\xB0E \xB7 discovered ${f.stats.discoveries} \xB7 storms shown as brown cells`}function Np(){let i=Z.colonyScreen.querySelector("#mg-inv"),e=Z.colonyScreen.querySelector("#mg-craft"),t=Z.colonyScreen.querySelector("#mg-build"),n="<h3>SUPPLIES</h3>";n+=`<div class="mg-item"><span>Rations</span><span>${f.food}</span></div>`,n+=`<div class="mg-item"><span>Potatoes</span><span>${f.potatoes}</span></div>`,n+=`<div class="mg-item"><span>Water</span><span>${f.water.toFixed(0)}L</span></div>`,n+=`<div class="mg-item"><span>Hydrazine burns</span><span>${f.hydrazine}</span></div>`,n+="<h3>MATERIALS</h3>";for(let o of["scrap","circuit","regolith","ice","candle"])n+=`<div class="mg-item"><span>${sr[o]}</span><span>${f.inv[o]||0}</span></div>`;n+="<h3>KITS (craft, then place outside)</h3>";for(let o of["kitSolar","kitGreenhouse","kitBeacon","kitCache"]){let l=f.inv[o]||0;n+=`<div class="mg-item"><span>${sr[o]}</span><span>${l}${l>0?` <button class="mg-btn" style="padding:2px 8px;font-size:10px" data-deploy="${o.slice(3).toLowerCase()}">DEPLOY</button>`:""}</span></div>`}f.flags.hasRtg&&!f.upgrades.rtg&&(n+='<div class="mg-item"><span>RTG (unsocketed)</span><span>\u2622</span></div>'),i.innerHTML=n,i.querySelectorAll("[data-deploy]").forEach(o=>o.onclick=()=>Nv(o.dataset.deploy));let s=mu(),r=`<h3>FABRICATOR ${s?"":"\u2014 out of range (return to the Hab)"}</h3>`;for(let o of gp){let l=s&&pl(o.cost);r+=`<div class="mg-recipe"><div class="rn">${o.name}</div><div class="rc">${o.desc}<br>needs: ${vp(o.cost)}</div><button data-r="${o.id}" ${l?"":"disabled"}>FABRICATE</button></div>`}e.innerHTML=r,e.querySelectorAll("button[data-r]").forEach(o=>o.onclick=()=>{let l=gp.find(c=>c.id===o.dataset.r);if(!(!l||!pl(l.cost)||!mu())){if(l.run){let c=l.run();if(c!==!0){Ne(c,"sys");return}pu(l.cost)}else{pu(l.cost);for(let c in l.gives)f.inv[c]=(f.inv[c]||0)+l.gives[c]}f.stats.crafted++,Te.craft(),Np()}});let a="<h3>UPGRADES</h3>";for(let o of fu){if(f.upgrades[o.id]){a+=`<div class="mg-recipe"><div class="rn">\u2713 ${o.name}</div><div class="rc">${o.desc}</div></div>`;continue}let l=null;o.bp&&!f.blueprints[o.bp]&&(l="blueprint required (survey tasks)"),o.needs&&!f.upgrades[o.needs]&&(l=`requires ${fu.find(h=>h.id===o.needs).name}`),o.needsRtg&&!f.flags.hasRtg&&(l="requires the buried RTG");let c=s&&!l&&pl(o.cost);a+=`<div class="mg-recipe"><div class="rn">${o.name}</div><div class="rc">${o.desc}<br>needs: ${vp(o.cost)}${l?"<br>\u26A0 "+l:""}</div><button data-u="${o.id}" ${c?"":"disabled"}>INSTALL</button></div>`}t.innerHTML=a,t.querySelectorAll("button[data-u]").forEach(o=>o.onclick=()=>{let l=fu.find(c=>c.id===o.dataset.u);!l||f.upgrades[l.id]||!mu()||!pl(l.cost)||l.bp&&!f.blueprints[l.bp]||l.needs&&!f.upgrades[l.needs]||l.needsRtg&&!f.flags.hasRtg||(pu(l.cost),f.upgrades[l.id]=!0,f.stats.crafted++,Te.craft(),Ne(`Installed: ${l.name}. ${l.desc}.`),Np())})}function n1(){let i=Z.journalScreen.querySelector("#mg-quests"),e=Z.journalScreen.querySelector("#mg-discoveries"),t=Z.journalScreen.querySelector("#mg-achievements"),n="<h3>NASA SURVEY TASKS</h3>";if(!f.pf.connected)n+='<div class="mg-jrow locked"><div class="jn">No uplink</div><div class="jd">Restore Pathfinder to receive survey tasks.</div></div>';else for(let a of Xr){let o=f.quests[a.id],l=Rs(a)?` \u2014 ${ui(it(O.pos,Rs(a)))}`:"";n+=`<div class="mg-jrow"><div class="jn">${o==="done"?"\u2713 ":""}${a.name}${l}</div><div class="jd">${a.desc}</div></div>`}i.innerHTML=n;let s=`<h3>DISCOVERIES (${f.stats.discoveries})</h3>`;for(let a of A.landers){let o=f.discovered[a.data.name];s+=`<div class="mg-jrow${o?"":" locked"}"><div class="jn">${o?a.data.name+" ("+a.data.year+")":"??? \u2014 undiscovered lander"}</div><div class="jd">${o?a.data.note:"Find it out there."}</div></div>`}for(let a of er){if(a.type==="bulge"||a.type==="albedo"||!a.note)continue;let o=f.discovered[a.name];s+=`<div class="mg-jrow${o?"":" locked"}"><div class="jn">${o?a.name:"??? \u2014 uncharted region"}</div><div class="jd">${o?a.note:""}</div></div>`}e.innerHTML=s;let r="<h3>ACHIEVEMENTS</h3>";for(let a of Cu){let o=f.achieved[a.id];r+=`<div class="mg-jrow ach${o?"":" locked"}"><div class="jn">${o?"\u2605 ":"\u2606 "}${a.name}</div><div class="jd">${a.desc}</div></div>`}t.innerHTML=r}var ze={keys:{},eHeld:!1,yaw:0,pitch:0,isTouch:"ontouchstart"in window||navigator.maxTouchPoints>0,touch:{joyX:0,joyY:0,joyId:null,lookId:null,lookX:0,lookY:0,sprint:!1,jumpT:0},sensitivity:1},no=!1,Ls=!1,Op=!1,kp=0,Bp=0,Ov=0;function Ml(){if(Ls&&ze.isTouch||f.uiOpen||En())return;let i=ce.engine.renderer.domElement;try{let e=i.requestPointerLock&&i.requestPointerLock();e&&e.catch&&e.catch(()=>{Ls=!0}),setTimeout(()=>{!no&&!f.uiOpen&&!En()&&(Ls=!0)},700)}catch{Ls=!0}}function kv(){return ze.isTouch&&Dn()-ze.touch.jumpT<.18}function Eu(){let i=ze.keys,e=0,t=0;(i.w||i.arrowup)&&(t-=1),(i.s||i.arrowdown)&&(t+=1),(i.a||i.arrowleft)&&(e-=1),(i.d||i.arrowright)&&(e+=1),e+=ze.touch.joyX,t+=ze.touch.joyY;let n=Math.hypot(e,t);return{mx:e,mz:t,mag:Math.min(1,n)}}function Au(){return!!ze.keys.shift||ze.touch.sprint}function Bv(){let i=ce.engine.renderer.domElement,e=ze.keys;window.addEventListener("keydown",t=>{if(t.repeat)return;let n=t.key.toLowerCase();e[n]=!0,["w","a","s","d"," ","arrowup","arrowdown","arrowleft","arrowright"].includes(n)&&t.preventDefault(),n==="e"&&(ze.eHeld=!0),!(!f.started||f.over||f.mode==="cutscene")&&(n==="escape"&&(En()?Is():f.uiOpen||Ep()),n==="f"&&f.mode==="rover"&&!f.uiOpen&&!En()&&vl(),n==="v"&&!f.uiOpen&&!En()&&(f.firstPerson=!f.firstPerson,Ne(f.firstPerson?"Helmet cam. Just you and the visor.":"Suit cam deployed. Looking good, Watney. Ish.","sys")),!f.uiOpen&&!f.flags.coldOpen&&(n==="m"&&Yr("map"),n==="c"&&Yr("colony"),n==="j"&&Yr("journal")))}),window.addEventListener("keyup",t=>{let n=t.key.toLowerCase();e[n]=!1,n==="e"&&(ze.eHeld=!1,f.holdT=0)}),window.addEventListener("blur",()=>{for(let t in e)e[t]=!1;ze.eHeld=!1}),document.addEventListener("pointerlockchange",()=>{no=document.pointerLockElement===i,Ov=Dn(),no&&(Ls=!1),!no&&f.started&&!f.uiOpen&&!En()&&!f.over&&f.mode!=="cutscene"&&Ep()}),document.addEventListener("pointerlockerror",()=>{Ls=!0}),i.addEventListener("mousedown",t=>{!f.started||f.uiOpen||En()||(no||Ml(),Ls&&(Op=!0,kp=t.clientX,Bp=t.clientY))}),window.addEventListener("mouseup",()=>{Op=!1}),window.addEventListener("mousemove",t=>{if(!f.started||f.uiOpen||En()||f.mode==="cutscene")return;let n=0,s=0;if(no){if(Dn()-Ov<.15||(n=t.movementX||0,s=t.movementY||0,Math.abs(n)>400||Math.abs(s)>400))return}else if(Ls&&Op)n=t.clientX-kp,s=t.clientY-Bp,kp=t.clientX,Bp=t.clientY;else return;ze.yaw-=n*.0024*ze.sensitivity,ze.pitch-=s*.0022*ze.sensitivity}),ze.isTouch&&i1(i)}function i1(i){let e=ze.touch;Ls=!0,Z.touch.style.display="block";let t=(r,a)=>{Z.joyKnob.style.left=40+r*40+"px",Z.joyKnob.style.top=40+a*40+"px"};Z.joy.addEventListener("touchstart",r=>{r.preventDefault(),r.stopPropagation(),e.joyId=r.changedTouches[0].identifier},{passive:!1}),window.addEventListener("touchmove",r=>{for(let a of r.changedTouches){if(a.identifier!==e.joyId)continue;let o=Z.joy.getBoundingClientRect(),l=(a.clientX-(o.left+o.width/2))/(o.width/2),c=(a.clientY-(o.top+o.height/2))/(o.height/2),h=Math.hypot(l,c);h>1&&(l/=h,c/=h),e.joyX=l,e.joyY=c,t(l,c),r.preventDefault()}},{passive:!1});let n=r=>{for(let a of r.changedTouches)a.identifier===e.joyId&&(e.joyId=null,e.joyX=0,e.joyY=0,t(0,0)),a.identifier===e.lookId&&(e.lookId=null)};window.addEventListener("touchend",n),window.addEventListener("touchcancel",n),i.addEventListener("touchstart",r=>{if(!(!f.started||f.uiOpen||En()))for(let a of r.changedTouches)a.identifier===e.joyId||e.lookId!==null||(e.lookId=a.identifier,e.lookX=a.clientX,e.lookY=a.clientY)},{passive:!0}),window.addEventListener("touchmove",r=>{for(let a of r.changedTouches)a.identifier===e.lookId&&(ze.yaw-=(a.clientX-e.lookX)*.005*ze.sensitivity,ze.pitch-=(a.clientY-e.lookY)*.0045*ze.sensitivity,e.lookX=a.clientX,e.lookY=a.clientY)},{passive:!0});let s=(r,a,o)=>{r.addEventListener("touchstart",l=>{l.preventDefault(),l.stopPropagation(),a()},{passive:!1}),o&&r.addEventListener("touchend",l=>{l.preventDefault(),o()},{passive:!1})};s(Z.tE,()=>{ze.eHeld=!0},()=>{ze.eHeld=!1,f.holdT=0}),s(Z.tJump,()=>{e.jumpT=Dn()}),s(Z.tSprint,()=>{e.sprint=!e.sprint,Z.tSprint.classList.toggle("on",e.sprint)}),s(Z.tExit,()=>{f.mode==="rover"&&vl()}),Z.tRow.querySelectorAll("[data-t]").forEach(r=>{s(r,()=>{if(!f.started||f.uiOpen)return;let a=r.dataset.t;a==="cam"?f.firstPerson=!f.firstPerson:Yr(a)})})}var zv=new qe;function ar(i,e){let t=ce.engine.camera;zv.lookAt(t.position,i,e),t.quaternion.setFromRotationMatrix(zv)}var O={q:new ht,pitch:-.12,alt:0,vy:0,onGround:!0,bob:0,pos:new C,up:new C(0,1,0),eyeH:1.68,vx:0,vz:0,face:0,speed:0,slope:0,landT:9,airT:0,radius:.42};function so(i,e){Gi(Ce.copy(i).normalize(),e||0,O.q),O.alt=0,O.vy=0,O.vx=0,O.vz=0,O.onGround=!0,ji(),Nt.init=!1}function ji(){O.up.set(0,1,0).applyQuaternion(O.q);let i=At(O.up);O.pos.copy(O.up).multiplyScalar(i+O.alt),A.playerPos=O.pos}var Du=new C;function Vr(i,e,t,n,s){Du.set(t,0,-e),!(Du.lengthSq()<1e-12)&&(Du.normalize(),i.multiply(_s.setFromAxisAngle(Du,n/s)))}function bl(i,e){i.multiply(_s.setFromAxisAngle(al,e))}var s1=1.1,Gv=11.75,r1=2.4;function Hv(i,e,t,n,s,r,a,o,l){Za(e,Ve.copy(Ce).multiplyScalar(At(Ce)),Ge);let c=Math.hypot(Ge.x,Ge.z);if(c>l+6||Math.abs(Ge.y)>6)return!1;let h=Ge.x,u=Ge.z,d=!1,p=Math.abs(Math.atan2(h,u))<=r||Math.abs(h)<a&&u>0;if(Math.abs(c-n)<s&&c>.001&&!p){let g=c<n?n-s:n+s;h=h/c*g,u=u/c*g,d=!0}if(u>n-.3&&u<l+t&&Math.abs(h)<o+t){let g=a-t*.6;Math.abs(h)<=a+.25&&u<l?Math.abs(h)>g&&(h=Math.sign(h)*g,d=!0):u<l&&(h=Math.sign(h)*(o+t),d=!0)}return d?(on(e,h,Ge.y,u,Ve),Ve.normalize(),fi.setFromUnitVectors(Ce,Ve),i.premultiply(fi),Ce.set(0,1,0).applyQuaternion(i),!0):!1}function bu(i,e){Ce.set(0,1,0).applyQuaternion(i);let t=!1,n=(s,r)=>{let a=Mn(Ce.x,Ce.y,Ce.z,s.x,s.y,s.z)*12e3,o=r+e;if(a<o&&a>.01){if(Ve.copy(Ce).sub(Ge.copy(s).multiplyScalar(Ce.dot(s))),Ve.lengthSq()<1e-12)return;Ve.normalize(),Ge.copy(s).multiplyScalar(12e3).addScaledVector(Ve,o),Ge.normalize(),fi.setFromUnitVectors(Ce,Ge),i.premultiply(fi),Ce.set(0,1,0).applyQuaternion(i),t=!0}};for(let s of nr)f.mode==="rover"&&s===A.roverCollider||n(s.v,s.r);for(let s of dl)n(s.v,s.r);A.hab&&Hv(i,A.hab,e,Qn,.5+e*.5,Y0+.02,s1,r1,Gv)&&(t=!0);for(let s of A.builtMeshes)s.kind==="greenhouse"&&Hv(i,s.group,e,ir.wall,.1+e*.75,Math.asin(ir.doorHalf/ir.wall),ir.doorHalf,ir.portalOuter,ir.portalEnd)&&(t=!0);return t}var Yi=null,Ze={mixer:null,actions:{},current:null,bones:{},lamp:null,lampMats:[],inner:null,seated:!1,stepPhase:0,lastClipTime:0},a1=5.1,o1=9.2;function Vv(){let i=Zn("astronaut",{face:!0});Yi=i.root,Ze.inner=i.inner,Ze.mixer=new Go(i.inner);for(let s of i.clips){let r=Ze.mixer.clipAction(s);["JumpStart","Land","Collapse","Wave"].includes(s.name)&&(r.setLoop(yh,1),r.clampWhenFinished=!0),Ze.actions[s.name]=r}for(let s of["hips","spine","chest","neck","head"])Ze.bones[s]=i.part(s);Ze.rest={chest:Ze.bones.chest.quaternion.clone(),head:Ze.bones.head.quaternion.clone()};let e=new fs(16774368,0,34,.5,.7,1.2),t=i.part("eye")||Ze.bones.head,n=new Tt;n.position.set(0,-1.1,8),e.position.set(0,.12,.1),t.add(e,n),e.target=n,Ze.lamp=e,i.inner.traverse(s=>{if(s.isMesh){let r=Array.isArray(s.material)?s.material:[s.material];for(let a of r)a.name==="light_white"&&Ze.lampMats.push(a)}}),ce.world.add(Yi),Ii("Idle",0)}function Ii(i,e=.22,t=!1){let n=Ze.actions[i];n&&(Ze.current===n&&!t||(n.reset(),n.enabled=!0,n.setEffectiveWeight(1),n.setEffectiveTimeScale(1),Ze.current&&Ze.current!==n&&n.crossFadeFrom(Ze.current,e,!1),n.play(),Ze.current=n,Ze.name=i))}function l1(){let i=Ri.active;return i&&i.pose==="stand"?"WorkStand":"WorkKneel"}function Wv(i){if(!Yi)return;let e=f.mode==="rover";if(e!==Ze.seated){Ze.seated=e;let o=A.rover&&A.rover.seat;e&&o?(o.add(Yi),Yi.position.set(0,-.52,0),Yi.quaternion.identity(),Ze.inner.rotation.y=0):(ce.world.add(Yi),Ze.inner.rotation.y=Math.PI)}Yi.visible=e?!!(A.rover&&A.rover.seat):!f.firstPerson&&!f.sleeping||f.over;let t=ze.eHeld&&Ri.active&&f.holdT>.02&&!e,n=1;if(f.over&&f.dead?Ii("Collapse",.25):e?Ii("Drive",.3):O.onGround?O.landT<.3&&O.speed<2.5?Ii("Land",.06):t?Ii(l1(),.25):O.speed>.6?(f.health<35||f.suit<6)&&O.speed<4?(Ii("Stagger",.3),n=ye(O.speed/2.4,.6,1.3)):O.speed>7?(Ii("Run",.2),n=ye(O.speed/o1,.7,1.25)):(Ii("Walk",.22),n=ye(O.speed/a1,.45,1.3)):Ii("Idle",.3):O.airT<.12&&O.vy>0&&Ze.name!=="Air"?Ii("JumpStart",.08):Ii("Air",.18),Ze.current&&Ze.current.setEffectiveTimeScale(n),Ze.bones.chest.quaternion.copy(Ze.rest.chest),Ze.bones.head.quaternion.copy(Ze.rest.head),Ze.mixer.update(i),!e&&(Yi.position.copy(O.pos),Yi.quaternion.copy(O.q).multiply(_s.setFromAxisAngle(al,O.face)),(Ze.name==="Walk"||Ze.name==="Run")&&O.onGround)){let o=Ze.current,l=o.getClip().duration,h=o.time%l/l<.5?0:1;h!==Ze.stepPhase&&(Ze.stepPhase=h,Es("footstep",{run:Ze.name==="Run",inside:f.inside,foot:h}))}let s=ye(O.pitch+.1,-.7,.6);if(!e&&!t&&!f.over){let o=ye(-io(O.face),-1.1,1.1);Ze.bones.chest&&Ze.bones.chest.rotateX(-s*.18),Ze.bones.head&&(Ze.bones.head.rotateX(-s*.4),Ze.bones.head.rotateY(o*.55))}let r=1-ye(ce.engine.sky.day*3,0,1),a=e||f.inside?0:Math.max(r,f.storm.i>.6?.5:0);Ze.lamp.intensity=nt(Ze.lamp.intensity,a*42,Kt(.25,i));for(let o of Ze.lampMats)o.emissiveIntensity=.15+a*5}var io=i=>(i=(i+Math.PI)%(Math.PI*2),i<0&&(i+=Math.PI*2),i-Math.PI),Nt={init:!1,pivot:new C,dist:5.6,fov:60,land:0},zp=new C,Jr=new C,Hp=new C,Gp=new C,Fu=new ht;function Nu(i){bl(O.q,ze.yaw),O.face=io(O.face-ze.yaw),O.pitch=ye(O.pitch+ze.pitch*(ze.invertY?-1:1),f.firstPerson?-1.45:-1.2,f.firstPerson?1.45:.85),ze.yaw=0,ze.pitch=0;let e=Eu(),t=ze.eHeld&&Ri.active&&f.holdT>.02,n=Au()&&f.suit>1&&!t,s=f.health<35||f.suit<6,r=n?Pe.runSpeed:Pe.walkSpeed;s&&(r*=.55);let a=0,o=0;if(e.mag>.12&&!t){let m=Math.hypot(e.mx,e.mz);a=e.mx/m*r*e.mag,o=e.mz/m*r*e.mag}O.slope=Jh(O.pos,1.3,zp),Hp.set(0,0,-1).applyQuaternion(O.q),Gp.set(1,0,0).applyQuaternion(O.q);let l=zp.dot(Gp),c=-zp.dot(Hp);if(O.onGround&&O.slope>.05){let m=a*l+o*c,x=Math.hypot(a,o);if(x>.01){let S=-m/x;if(S>0){let y=ye(1-O.slope*S*1.05,0,1),M=(1-(O.slope>.95?0:y))*-m;a+=l*M,o+=c*M}else{let y=1+Math.min(.18,O.slope*.25)*-S;a*=y,o*=y}}if(O.slope>1.1){let S=Math.min(7,(O.slope-1)*9);a+=l*S,o+=c*S}}let h=O.onGround?Math.hypot(a,o)>.1?26:34:5,u=a-O.vx,d=o-O.vz,p=Math.hypot(u,d);if(p>1e-5){let m=Math.min(p,h*i);O.vx+=u/p*m,O.vz+=d/p*m}O.speed=Math.hypot(O.vx,O.vz);let g=O.pos.length();if(O.speed>.01){let m=O.speed*i;Vr(O.q,O.vx/O.speed,O.vz/O.speed,m,12e3+O.alt),O.bob+=i*(O.speed>7?11:7)*Math.min(1,O.speed/5),f.stats.walked+=m;let x=Math.atan2(-O.vx,-O.vz),S=io(x-O.face);O.face=io(O.face+S*Kt(.07,i)*Math.min(1,O.speed/1.5))}if(t&&Ri.active){let m=Ri.active.pos&&Ri.active.pos();if(m&&it(m,O.pos)>.4){Jr.copy(m).sub(O.pos);let x=Math.atan2(-Jr.dot(Gp),Jr.dot(Hp));O.face=io(O.face+io(x-O.face)*Kt(.1,i))}}bu(O.q,O.radius)&&(O.vx*=.6,O.vz*=.6),O.q.normalize(),O.up.set(0,1,0).applyQuaternion(O.q);let v=At(O.up);if(O.onGround){let m=g-v;m>.45+6*i?(O.onGround=!1,O.alt=m,O.vy=0,O.airT=0):O.alt=0,O.onGround&&(ze.keys[" "]||kv())&&!t&&O.slope<1.1&&(O.vy=Pe.jumpV,O.onGround=!1,O.airT=0,O.alt=.001,Es("jump",{}))}else if(O.alt=Math.max(0,g-v),O.vy-=Pe.gravity*i,O.alt+=O.vy*i,O.airT+=i,O.alt<=0){let m=-O.vy;if(O.alt=0,O.vy=0,O.onGround=!0,O.landT=0,Nt.land=Math.min(1,m/7),Es("land",{speed:m,inside:f.inside}),m>9.5){let x=(m-9.5)*7;f.health=Math.max(0,f.health-x),f.shake=Math.max(f.shake,.8),Es("hurt",{amount:x,cause:"fall"})}}if(O.landT+=i,ji(),h1(i,e.mag>.12&&n),A.hab&&(Za(A.hab,O.pos,Ge),f.inside=Math.hypot(Ge.x,Ge.z)<Qn-.3&&Ge.y<6,f.inAirlock=!f.inside&&Math.abs(Ge.x)<1.3&&Ge.z>Qn-.3&&Ge.z<Gv),!f.inside){for(let m of A.builtMeshes)if(m.kind==="greenhouse"&&it(O.pos,m.group.position)<4){f.inside=!0;break}}}function c1(i,e){return i>-6.6&&i<-1.9&&e>-4.5&&e<2.9?2.08:Math.hypot(i,e)>6.2?2.6:3.3}function h1(i,e){let t=ce.engine.camera,n=Nt.land*.22;if(Nt.land=Math.max(0,Nt.land-i*4),f.firstPerson){let r=O.speed>.5&&O.onGround?Math.sin(O.bob)*.045:0;t.position.copy(O.pos).addScaledVector(O.up,O.eyeH+r-n),t.quaternion.copy(O.q).multiply(_s.setFromAxisAngle(ol,O.pitch)),Nt.init=!1}else{let r=f.inside||f.inAirlock;Jr.copy(O.pos).addScaledVector(O.up,(r?1.5:1.62)-n),!Nt.init||Nt.pivot.distanceTo(Jr)>6?(Nt.pivot.copy(Jr),Nt.init=!0):Nt.pivot.lerp(Jr,Kt(.045,i)),Fu.copy(O.q).multiply(_s.setFromAxisAngle(ol,O.pitch));let a=r?3.1:5.4+Math.min(1.2,O.speed*.08),o=r?.2:.42,l=a;for(let h=0;h<6;h++){t.position.copy(Nt.pivot).add(Ce.set(.55*Math.min(1,l/3),o,l).applyQuaternion(Fu));let u=t.position.length()>=At(t.position)+.35;if(u&&A.hab&&r&&(Za(A.hab,t.position,Ge),u=f.inside?Math.hypot(Ge.x,Ge.z)<Qn-.45:Math.abs(Ge.x)<.95),u)break;l*=.72}if(Nt.dist=l<Nt.dist?l:nt(Nt.dist,l,Kt(.25,i)),t.position.copy(Nt.pivot).add(Ce.set(.55*Math.min(1,Nt.dist/3),o,Nt.dist).applyQuaternion(Fu)),A.hab&&r){Za(A.hab,t.position,Ge);let h=f.inside?c1(Ge.x,Ge.z):2.2;Ge.y>h?Nt.duck=nt(Nt.duck||0,Ge.y-h,Kt(.08,i)):Nt.duck=nt(Nt.duck||0,0,Kt(.15,i)),Nt.duck>.005&&t.position.addScaledVector(O.up,-Nt.duck)}else Nt.duck=0;let c=At(t.position)+.3;t.position.length()<c&&t.position.normalize().multiplyScalar(c),t.quaternion.copy(Fu)}f.shake>0&&(f.shake=Math.max(0,f.shake-i*1.6),ze.reducedMotion||t.position.addScaledVector(Ce.set(Math.random()-.5,Math.random()-.5,Math.random()-.5),f.shake*.4));let s=ce.engine.baseFov+(e?7:0);t.fov=nt(t.fov,s,Kt(.18,i)),t.updateProjectionMatrix()}function Rv(){return jh.copy(O.pos).normalize()}var lr=new C,or=new C,Cl=new C,Vp=new ht,qv=new C,Wp=0,qp=0,Xp=0;function jp(i){return i.normalize().multiplyScalar(At(i))}function Xv(){du("footstep",i=>{f.inside||f.inAirlock||f.mode!=="walk"||(Vp.copy(O.q).multiply(new ht().setFromAxisAngle(al,O.face)),or.set(0,0,-1).applyQuaternion(Vp),Cl.set(1,0,0).applyQuaternion(Vp),lr.copy(O.pos).addScaledVector(Cl,i.foot?.12:-.12),jp(lr),ce.vfx.mark("boot",lr,or),ce.vfx.puff(lr,{count:i.run?4:2,speed:i.run?.9:.5,up:.35,spread:.12,size:i.run?.34:.24,life:1.3,dir:qv.copy(or).multiplyScalar(-.5)}))}),du("land",i=>{f.inside||f.inAirlock||ce.vfx.puff(O.pos,{count:Math.min(16,5+Math.round(i.speed*2)),speed:1.2+i.speed*.25,up:.5,spread:.25,size:.5,life:1.9})}),du("dust",i=>{ce.vfx.puff(i.pos,i)})}function Kp(i){if(f.mode==="rover"&&A.rover){let e=Math.abs(pt.speed);if(e>.8){let t=A.rover.group;if(or.set(0,0,-1).applyQuaternion(pt.q),Cl.set(1,0,0).applyQuaternion(pt.q),Wp+=e*i,Wp>.85){Wp=0;for(let n of[-1.22,1.22])lr.copy(t.position).addScaledVector(Cl,n).addScaledVector(or,-1.9*Math.sign(pt.speed)),ce.vfx.mark("tyre",jp(lr),or)}for(qp+=i*Math.min(40,6+e*1.2);qp>1;){qp-=1;let n=Math.random()<.5?-1.22:1.22;lr.copy(t.position).addScaledVector(Cl,n).addScaledVector(or,-2.2*Math.sign(pt.speed)),ce.vfx.puff(jp(lr),{count:1,speed:.6+e*.04,up:.5+e*.03,spread:.3,size:.6+e*.03,life:2.2+e*.03,dir:qv.copy(or).multiplyScalar(-e*.18*Math.sign(pt.speed))})}}}if(f.mode==="cutscene"&&A.mavFlame&&A.mavFlame.visible&&A.mavRocket){let e=A.mavRocket.position.y-(A.mavRocketY||0);Xp+=i,e<60&&Xp>.03&&(Xp=0,ce.vfx.puff(A.mav.position,{count:6,speed:9+Math.random()*6,up:1.5,spread:2.5,size:2.6,life:4.5,tone:.5}))}}function u1(){let i=new URLSearchParams(location.search).get("q");if(i)return i;try{let t=localStorage.getItem("stranded2-quality");if(t)return t}catch{}return ze.isTouch&&Math.min(screen.width,screen.height)<900?"low":"high"}function Uu(i,e){Z.panel.innerHTML=`<h1>STRANDED II</h1><h2>${e||"Loading"}</h2><div style="height:6px;border:1px solid rgba(242,216,184,.4)"><div style="height:100%;width:${Math.round(i*100)}%;background:#ffb45e"></div></div>`,Z.overlay.style.display="flex"}async function d1(){Uu(0,"Receiving orbital survey");let i=ce.engine=new kh(Ss,u1());ce.world=new qt,ce.world.name="world",i.scene.add(ce.world);let e=await E0(Uu,{maxColorFace:i.q.scale<.7?512:1024});ce.planet=e.planet;let t=C0(e.albedoCube,{fine:i.q.fine});ce.terrainMaterial=t,ce.outdoor=new qt,i.scene.add(ce.outdoor),ce.terrain=new Wh({planet:e.planet,heightData:e.heightData,parent:ce.outdoor,material:t,workerUrl:$s("terrain-worker.js"),grid:i.q.grid,maxLevel:i.q.maxLevel,split:i.q.split,workers:i.q.workers,shadowLevel:i.q.maxLevel-i.q.terrainShadowLevels+1}),ce.rocks=new hu(ce.outdoor,ce.terrain,{density:i.q.rocks,shadowRange:i.q.scale>=.7?i.q.shadowRange:0}),ce.vfx=new uu(i.scene,{air:i.q.scale<.7?700:1600,puffs:i.q.scale<.7?300:600}),Xv();let n=new Image;n.onload=()=>{ce.mapImage=n},n.src=$s("assets/mars/map.jpg"),await K0(["astronaut","rover","hab","mav","hermes","farm_plot","solar_panel","uplink_dish","pathfinder","viking","mars3","beagle2","mer","phoenix","insight","msl","ingenuity","zhurong","schiaparelli_wreck","greenhouse","solar_kit","beacon","o2_cache","supply_pod","rtg","debris_a","debris_b","debris_c","regolith_pile","ice_outcrop","uplink_pad"],s=>Uu(.9+s*.1,"Unpacking equipment")),Vv(),Bv(),Cs(),m1(),Kv(0),Uu(1,"Building terrain"),await ce.terrain.settle(i.camera.position,15e3),Mv(),$p=Dn(),requestAnimationFrame(Yv),window.__MG.ready=!0,"serviceWorker"in navigator&&location.protocol==="https:"&&navigator.serviceWorker.register($s("sw.js")).catch(()=>{})}var $p=0,Yp=0,Jp=0,ro=0,jv=0;var Pl=0,Ou=0;function Kv(i){let e=ce.engine.camera,t=ce.engine.sunDir;Yp+=i*.012,Cs(),Ce.copy(t).multiplyScalar(12e3*2.6),Ve.set(-t.z,0,t.x),e.position.copy(Ce).addScaledVector(Ve,Math.sin(Yp)*12e3*1.1).setY(12e3*(.5+.35*Math.sin(Yp*.6))),ar(Ge.set(0,0,0),Ve.set(0,1,0))}function f1(i,e){let t=ce.engine;t.camera.updateMatrixWorld(),ce.terrain.update(t.camera.position),ce.rocks.update(t.camera.position),Z0(t.camera.position);let n=f.started&&!!A.sealedInside&&!f.over;ce.outdoor.visible=!n,t.update({dt:i,sealed:n,dust:f.started?f.storm.i:0,inside:f.started&&(f.inside||f.inAirlock)&&f.mode==="walk",power:!f.started||f.power>.5,focus:e}),ce.vfx.update(i,t.camera,{storm:f.started?f.storm.i:0,sunIntensity:t.sky.sunIntensity,sunColor:t.sky.sunColor,ambient:t.sky.ambientSky,inside:n||f.started&&f.inside,pixelHeight:t.renderer.domElement.height}),t.final.uniforms.uDanger.value=A.danger||0,t.final.uniforms.uCold.value=A.cold||0,t.render()}function ao(i){if(!f.started)return Kv(i),null;let e=f.mode==="rover"?A.rover.group.position:O.pos;if(f.over&&f.mode!=="cutscene"||(f.uiOpen||En())&&!f.sleeping)return e;if(f.mode==="cutscene")return A.launchAnim&&A.launchAnim(i),Kp(i),Cs(),A.mav.position;f.sleeping||(Ip(i),wu(i,!1),f.mode==="walk"?Nu(i):f.mode==="rover"&&uv(i),Wv(i),cv(i),Pv(i),p1(),Kp(i)),Te.wind((f.inside?.05:.16)+f.storm.i*.65+(f.breach.active&&f.inside?.4:0)),ro+=i,A.beaconMats&&qi(A.beaconMats,Math.sin(ro*5)>0?1:.05),A.mavStrobeMats&&qi(A.mavStrobeMats,Math.sin(ro*7)>.6?1.6:.04);let t=Math.sin(ro*6)>.7?1.8:.03;for(let n of A.pods)n.strobe&&!n.taken&&n.group.visible&&qi(n.strobe,t);for(let n of A.builtMeshes)n.lamp&&n.group.visible&&qi(n.lamp,.25+1.5*Math.max(0,Math.sin(ro*2.2))**6);return A.padLampMats&&qi(A.padLampMats,f.pf.loaded&&!f.pf.connected?.55+.45*Math.sin(ro*4):.2),Q0(i),Cs(),xv(),bv(),vv(),Z.mapScreen.style.display==="block"&&(Jp+=i,Jp>.7&&(Jp=0,Up())),e}var $r=null;function Yv(){requestAnimationFrame(Yv);let i=Dn(),e=i-$p,t=Math.min(e,.05);$p=i,Pl+=e,Ou++,Pl>1&&(window.__MG.fixedResolution||ce.engine.adaptResolution(Pl/Ou*1e3,1e3/55),window.__MG.fps=Ou/Pl,Pl=0,Ou=0),window.__MG.paused||($r=ao(t)),f1(window.__MG.paused?0:t,$r)}function p1(){if(!f.flags.pfRevealed||f.pf.found||f.pf.loaded||f.pf.connected)return;let i=it(O.pos,A.pathfinder.position);if(i>90)return;let e=ye(i/60,.12,1.4);Dn()-jv>e&&(jv=Dn(),Te.beep(1200,.04,"square",.05)),i<10&&!f.pf.found&&(f.pf.found=!0,Ne("Signal source dead ahead. There you are."))}function m1(){window.__MG={ctx:ce,S:f,World:A,player:O,roverF:pt,BAL:Pe,DIFFICULTIES:$n,interactables:gu,input:ze,interaction:Ri,llToVec:kt,surfaceAt:At,groundDist:it,applyRates:wu,advanceTime:Ip,newSol:Tu,sleepToDawn:El,checkpoint:Ki,restoreCheckpoint:yu,serializeState:xu,applyState:xl,saveGame:As,syncAllVisuals:An,initPlayerAt:so,initRoverAt:gl,newGame:Sl,continueGame:Ap,checkAchievements:Ci,ready:!1,fps:0,paused:!1,tick(i,e=1){for(let t=0;t<e;t++)$r=ao(i)},fixedResolution:new URLSearchParams(location.search).has("fixed"),async start(i,e,t="survival"){if(i!==void 0){let n=Math.random,s=[(i/52+1)/2,e/360];Math.random=()=>s.length?s.shift():n();try{Sl(t)}finally{Math.random=n}}else Sl(t);return Z.overlay.style.display="none",f.uiOpen=!1,await this.settle(),{lat:A.spawn.lat,lon:A.spawn.lon}},skipIntro(){Object.assign(f.flags,{coldOpen:!1,suitSealed:!0,didMath:!0}),f.checkedSystems={oxy:!0,rec:!0},f.suit=100},async tp(i,e,t=0){return so(kt(i,e),t),f.mode==="walk"&&Nu(.001),this.settle()},async tpHab(i,e,t=0){let n=A.hab.position.clone().normalize(),s=new C(-n.z,0,n.x).normalize(),r=new C().crossVectors(n,s);return so(n.addScaledVector(s,i/12e3).addScaledVector(r,e/12e3).normalize(),t),f.mode==="walk"&&Nu(.001),this.settle()},setLocalTime(i){let e=Ce.copy(O.pos).normalize(),t=(Math.atan2(-e.z,e.x)*180/Math.PI+360)%360;f.tod=((i/24.66-.5-t/360)%1+1)%1,Cs()},tpLocal(i,e,t=0){let n=on(A.hab,i,0,e,new C);so(n.normalize(),t),$r=ao(.001)},tpNear(i,e=1.5){let t=i.clone().normalize(),n=new C(-t.z,0,t.x).normalize(),s=new C().crossVectors(t,n);so(t.addScaledVector(s,e/12e3).normalize(),0),$r=ao(.001)},roverTo(i,e=6){let t=i.clone().normalize(),n=new C(-t.z,0,t.x).normalize(),s=new C().crossVectors(t,n);gl(t.addScaledVector(s,-e/12e3).normalize(),0)},hold(i){ze.eHeld=!0;for(let e=0;e<Math.ceil(i/.05);e++)$r=ao(.05);ze.eHeld=!1,$r=ao(.05)},setStorm(i){f.storm.i=i,f.storm.hold=i},look(i){O.pitch=i},async settle(){return ce.engine.camera.updateMatrixWorld(),ce.terrain.settle(ce.engine.camera.position,2e4)},info(){return{fps:+this.fps.toFixed(1),...ce.engine.info(),...ce.terrain.stats(),rocks:ce.rocks.counts}}}}d1().catch(i=>{console.error(i),pi({title:"SOMETHING BROKE",body:`The game could not start.

${String(i&&i.message||i)}

Reload the page to try again.`,buttons:[]})});
