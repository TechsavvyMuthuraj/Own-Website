"use client";

import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Hyperspeed.css";

const DEFAULT_EFFECT_OPTIONS = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};

interface HyperspeedProps {
  effectOptions?: Partial<typeof DEFAULT_EFFECT_OPTIONS>;
  lightMode?: boolean;
}

const Hyperspeed = ({ effectOptions = DEFAULT_EFFECT_OPTIONS, lightMode = false }: HyperspeedProps) => {
  const hyperspeed = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    if (appRef.current) {
      appRef.current.dispose();
      appRef.current = null;
      const container = hyperspeed.current;
      if (container) {
        while (container.firstChild) container.removeChild(container.firstChild);
      }
    }

    const mountainUniforms = {
      uFreq: { value: new THREE.Vector3(3, 6, 10) },
      uAmp: { value: new THREE.Vector3(30, 30, 20) },
    };
    const xyUniforms = {
      uFreq: { value: new THREE.Vector2(5, 2) },
      uAmp: { value: new THREE.Vector2(25, 15) },
    };
    const LongRaceUniforms = {
      uFreq: { value: new THREE.Vector2(2, 3) },
      uAmp: { value: new THREE.Vector2(35, 10) },
    };
    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
    };
    const deepUniforms = {
      uFreq: { value: new THREE.Vector2(4, 8) },
      uAmp: { value: new THREE.Vector2(10, 20) },
      uPowY: { value: new THREE.Vector2(20, 2) },
    };

    const nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

    const distortions: Record<string, any> = {
      mountainDistortion: {
        uniforms: mountainUniforms,
        getDistortion: `
          uniform vec3 uAmp; uniform vec3 uFreq;
          #define PI 3.14159265358979
          float nsin(float val){ return sin(val) * 0.5 + 0.5; }
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3(
              cos(progress*PI*uFreq.x+uTime)*uAmp.x - cos(movementProgressFix*PI*uFreq.x+uTime)*uAmp.x,
              nsin(progress*PI*uFreq.y+uTime)*uAmp.y - nsin(movementProgressFix*PI*uFreq.y+uTime)*uAmp.y,
              nsin(progress*PI*uFreq.z+uTime)*uAmp.z - nsin(movementProgressFix*PI*uFreq.z+uTime)*uAmp.z
            );
          }`,
        getJS: (progress: number, time: number) => {
          const fix = 0.02, f = mountainUniforms.uFreq.value, a = mountainUniforms.uAmp.value;
          return new THREE.Vector3(
            Math.cos(progress * Math.PI * f.x + time) * a.x - Math.cos(fix * Math.PI * f.x + time) * a.x,
            nsin(progress * Math.PI * f.y + time) * a.y - nsin(fix * Math.PI * f.y + time) * a.y,
            nsin(progress * Math.PI * f.z + time) * a.z - nsin(fix * Math.PI * f.z + time) * a.z
          ).multiply(new THREE.Vector3(2, 2, 2)).add(new THREE.Vector3(0, 0, -5));
        },
      },
      xyDistortion: {
        uniforms: xyUniforms,
        getDistortion: `
          uniform vec2 uFreq; uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float movementProgressFix = 0.02;
            return vec3(
              cos(progress*PI*uFreq.x+uTime)*uAmp.x - cos(movementProgressFix*PI*uFreq.x+uTime)*uAmp.x,
              sin(progress*PI*uFreq.y+PI/2.+uTime)*uAmp.y - sin(movementProgressFix*PI*uFreq.y+PI/2.+uTime)*uAmp.y,
              0.
            );
          }`,
        getJS: (progress: number, time: number) => {
          const fix = 0.02, f = xyUniforms.uFreq.value, a = xyUniforms.uAmp.value;
          return new THREE.Vector3(
            Math.cos(progress * Math.PI * f.x + time) * a.x - Math.cos(fix * Math.PI * f.x + time) * a.x,
            Math.sin(progress * Math.PI * f.y + time + Math.PI / 2) * a.y - Math.sin(fix * Math.PI * f.y + time + Math.PI / 2) * a.y,
            0
          ).multiply(new THREE.Vector3(2, 0.4, 1)).add(new THREE.Vector3(0, 0, -3));
        },
      },
      LongRaceDistortion: {
        uniforms: LongRaceUniforms,
        getDistortion: `
          uniform vec2 uFreq; uniform vec2 uAmp;
          #define PI 3.14159265358979
          vec3 getDistortion(float progress){
            float camProgress = 0.0125;
            return vec3(
              sin(progress*PI*uFreq.x+uTime)*uAmp.x - sin(camProgress*PI*uFreq.x+uTime)*uAmp.x,
              sin(progress*PI*uFreq.y+uTime)*uAmp.y - sin(camProgress*PI*uFreq.y+uTime)*uAmp.y,
              0.
            );
          }`,
        getJS: (progress: number, time: number) => {
          const cp = 0.0125, f = LongRaceUniforms.uFreq.value, a = LongRaceUniforms.uAmp.value;
          return new THREE.Vector3(
            Math.sin(progress * Math.PI * f.x + time) * a.x - Math.sin(cp * Math.PI * f.x + time) * a.x,
            Math.sin(progress * Math.PI * f.y + time) * a.y - Math.sin(cp * Math.PI * f.y + time) * a.y,
            0
          ).multiply(new THREE.Vector3(1, 1, 0)).add(new THREE.Vector3(0, 0, -5));
        },
      },
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq; uniform vec4 uAmp;
          float nsin(float val){ return sin(val)*0.5+0.5; }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return cos(PI*progress*uFreq.r+uTime)*uAmp.r + pow(cos(PI*progress*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g;
          }
          float getDistortionY(float progress){
            return -nsin(PI*progress*uFreq.b+uTime)*uAmp.b + -pow(nsin(PI*progress*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a;
          }
          vec3 getDistortion(float progress){
            return vec3(getDistortionX(progress)-getDistortionX(0.0125), getDistortionY(progress)-getDistortionY(0.0125), 0.);
          }`,
        getJS: (progress: number, time: number) => {
          const f = turbulentUniforms.uFreq.value, a = turbulentUniforms.uAmp.value;
          const getX = (p: number) => Math.cos(Math.PI * p * f.x + time) * a.x + Math.pow(Math.cos(Math.PI * p * f.y + time * (f.y / f.x)), 2) * a.y;
          const getY = (p: number) => -nsin(Math.PI * p * f.z + time) * a.z - Math.pow(nsin(Math.PI * p * f.w + time / (f.z / f.w)), 5) * a.w;
          return new THREE.Vector3(getX(progress) - getX(progress + 0.007), getY(progress) - getY(progress + 0.007), 0)
            .multiply(new THREE.Vector3(-2, -5, 0)).add(new THREE.Vector3(0, 0, -10));
        },
      },
      turbulentDistortionStill: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq; uniform vec4 uAmp;
          float nsin(float val){ return sin(val)*0.5+0.5; }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return cos(PI*progress*uFreq.r)*uAmp.r + pow(cos(PI*progress*uFreq.g*(uFreq.g/uFreq.r)),2.)*uAmp.g;
          }
          float getDistortionY(float progress){
            return -nsin(PI*progress*uFreq.b)*uAmp.b + -pow(nsin(PI*progress*uFreq.a/(uFreq.b/uFreq.a)),5.)*uAmp.a;
          }
          vec3 getDistortion(float progress){
            return vec3(getDistortionX(progress)-getDistortionX(0.02), getDistortionY(progress)-getDistortionY(0.02), 0.);
          }`,
      },
      deepDistortion: {
        uniforms: deepUniforms,
        getDistortion: `
          uniform vec2 uFreq; uniform vec2 uAmp; uniform vec2 uPowY;
          float nsin(float val){ return sin(val)*0.5+0.5; }
          #define PI 3.14159265358979
          float getDistortionX(float progress){ return sin(progress*PI*uFreq.x+uTime)*uAmp.x; }
          float getDistortionY(float progress){ return pow(abs(progress*uPowY.x),uPowY.y)+sin(progress*PI*uFreq.y+uTime)*uAmp.y; }
          vec3 getDistortion(float progress){
            return vec3(getDistortionX(progress)-getDistortionX(0.02), getDistortionY(progress)-getDistortionY(0.02), 0.);
          }`,
        getJS: (progress: number, time: number) => {
          const f = deepUniforms.uFreq.value, a = deepUniforms.uAmp.value, p = deepUniforms.uPowY.value;
          const getX = (v: number) => Math.sin(v * Math.PI * f.x + time) * a.x;
          const getY = (v: number) => Math.pow(v * p.x, p.y) + Math.sin(v * Math.PI * f.y + time) * a.y;
          return new THREE.Vector3(getX(progress) - getX(progress + 0.01), getY(progress) - getY(progress + 0.01), 0)
            .multiply(new THREE.Vector3(-2, -4, 0)).add(new THREE.Vector3(0, 0, -10));
        },
      },
    };

    // ── Shader strings ──────────────────────────────────────────────────
    const distortion_uniforms = {
      uDistortionX: { value: new THREE.Vector2(80, 3) },
      uDistortionY: { value: new THREE.Vector2(-40, 2.5) },
    };
    const distortion_vertex = `
      #define PI 3.14159265358979
      uniform vec2 uDistortionX; uniform vec2 uDistortionY;
      float nsin(float val){ return sin(val)*0.5+0.5; }
      vec3 getDistortion(float progress){
        progress=clamp(progress,0.,1.);
        float xAmp=uDistortionX.r,xFreq=uDistortionX.g,yAmp=uDistortionY.r,yFreq=uDistortionY.g;
        return vec3(xAmp*nsin(progress*PI*xFreq-PI/2.),yAmp*nsin(progress*PI*yFreq-PI/2.),0.);
      }`;

    const carLightsFragment = `
      #define USE_FOG
      
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      
      varying vec3 vColor; varying vec2 vUv; uniform vec2 uFade;
      void main(){
        vec3 color=vec3(vColor);
        float alpha=smoothstep(uFade.x,uFade.y,vUv.x);
        gl_FragColor=vec4(color,alpha);
        if(gl_FragColor.a<0.0001)discard;
        
        ${THREE.ShaderChunk["fog_fragment"]}
      }`;

    const carLightsVertex = `
      #define USE_FOG
      
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      
      attribute vec3 aOffset; attribute vec3 aMetrics; attribute vec3 aColor;
      uniform float uTravelLength; uniform float uTime;
      varying vec2 vUv; varying vec3 vColor;
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed=position.xyz;
        float radius=aMetrics.r,myLength=aMetrics.g,speed=aMetrics.b;
        transformed.xy*=radius; transformed.z*=myLength;
        transformed.z+=myLength-mod(uTime*speed+aOffset.z,uTravelLength);
        transformed.xy+=aOffset.xy;
        float progress=abs(transformed.z/uTravelLength);
        transformed.xyz+=getDistortion(progress);
        vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);
        gl_Position=projectionMatrix*mvPosition;
        vUv=uv; vColor=aColor;
        
        ${THREE.ShaderChunk["fog_vertex"]}
      }`;

    const sideSticksVertex = `
      #define USE_FOG
      
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      
      attribute float aOffset; attribute vec3 aColor; attribute vec2 aMetrics;
      uniform float uTravelLength; uniform float uTime;
      varying vec3 vColor;
      mat4 rotationY(in float angle){
        return mat4(cos(angle),0,sin(angle),0, 0,1,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);
      }
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed=position.xyz;
        float width=aMetrics.x,height=aMetrics.y;
        transformed.xy*=vec2(width,height);
        float time=mod(uTime*60.*2.+aOffset,uTravelLength);
        transformed=(rotationY(3.14/2.)*vec4(transformed,1.)).xyz;
        transformed.z+=-uTravelLength+time;
        float progress=abs(transformed.z/uTravelLength);
        transformed.xyz+=getDistortion(progress);
        transformed.y+=height/2.; transformed.x+=-width/2.;
        vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);
        gl_Position=projectionMatrix*mvPosition;
        vColor=aColor;
        
        ${THREE.ShaderChunk["fog_vertex"]}
      }`;

    const sideSticksFragment = `
      #define USE_FOG
      
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      
      varying vec3 vColor;
      void main(){
        gl_FragColor=vec4(vColor,1.);
        
        ${THREE.ShaderChunk["fog_fragment"]}
      }`;

    const roadMarkings_vars = `
      uniform float uLanes; uniform vec3 uBrokenLinesColor; uniform vec3 uShoulderLinesColor;
      uniform float uShoulderLinesWidthPercentage,uBrokenLinesWidthPercentage,uBrokenLinesLengthPercentage;
      highp float random(vec2 co){
        highp float a=12.9898,b=78.233,c=43758.5453,dt=dot(co.xy,vec2(a,b)),sn=mod(dt,3.14);
        return fract(sin(sn)*c);
      }`;

    const roadMarkings_fragment = `
      uv.y=mod(uv.y+uTime*0.05,1.);
      float laneWidth=1./uLanes,brokenLineWidth=laneWidth*uBrokenLinesWidthPercentage,laneEmptySpace=1.-uBrokenLinesLengthPercentage;
      float brokenLines=step(1.-brokenLineWidth,fract(uv.x*2.))*step(laneEmptySpace,fract(uv.y*10.));
      float sideLines=step(1.-brokenLineWidth,fract((uv.x-laneWidth*(uLanes-1.))*2.))+step(brokenLineWidth,uv.x);
      brokenLines=mix(brokenLines,sideLines,uv.x);`;

    const roadBaseFragment = `
      #define USE_FOG
      varying vec2 vUv; uniform vec3 uColor; uniform float uTime;
      #include <roadMarkings_vars>
      
      ${THREE.ShaderChunk["fog_pars_fragment"]}
      
      void main(){
        vec2 uv=vUv; vec3 color=vec3(uColor);
        #include <roadMarkings_fragment>
        gl_FragColor=vec4(color,1.);
        
        ${THREE.ShaderChunk["fog_fragment"]}
      }`;

    const islandFragment = roadBaseFragment.replace("#include <roadMarkings_fragment>", "").replace("#include <roadMarkings_vars>", "");
    const roadFragment = roadBaseFragment.replace("#include <roadMarkings_fragment>", roadMarkings_fragment).replace("#include <roadMarkings_vars>", roadMarkings_vars);

    const roadVertex = `
      #define USE_FOG
      uniform float uTime;
      
      ${THREE.ShaderChunk["fog_pars_vertex"]}
      
      uniform float uTravelLength; varying vec2 vUv;
      #include <getDistortion_vertex>
      void main(){
        vec3 transformed=position.xyz;
        vec3 distortion=getDistortion((transformed.y+uTravelLength/2.)/uTravelLength);
        transformed.x+=distortion.x; transformed.z+=distortion.y; transformed.y+=-1.*distortion.z;
        vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);
        gl_Position=projectionMatrix*mvPosition; vUv=uv;
        
        ${THREE.ShaderChunk["fog_vertex"]}
      }`;

    // ── Helpers ──────────────────────────────────────────────────────────
    const random = (base: number | number[]) =>
      Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;

    const pickRandom = (arr: any) => (Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr);

    function lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
      let change = (target - current) * speed;
      if (Math.abs(change) < limit) change = target - current;
      return change;
    }

    function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer, setSize: Function) {
      const canvas = renderer.domElement;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return false;
      const needResize = canvas.width !== w || canvas.height !== h;
      if (needResize) setSize(w, h, false);
      return needResize;
    }

    // ── Classes ──────────────────────────────────────────────────────────
    class CarLights {
      webgl: any; options: any; colors: any; speed: any; fade: any; mesh!: THREE.Mesh;
      constructor(webgl: any, options: any, colors: any, speed: any, fade: any) {
        this.webgl = webgl; this.options = options; this.colors = colors; this.speed = speed; this.fade = fade;
      }
      init() {
        const options = this.options;
        const curve = new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1));
        const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any);
        instanced.instanceCount = options.lightPairsPerRoadWay * 2;
        const laneWidth = options.roadWidth / options.lanesPerRoad;
        const aOffset: number[] = [], aMetrics: number[] = [], aColor: number[] = [];
        let colors = Array.isArray(this.colors) ? this.colors.map((c: number) => new THREE.Color(c)) : new THREE.Color(this.colors);
        for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
          const radius = random(options.carLightsRadius), length = random(options.carLightsLength), speed = random(this.speed);
          const carLane = i % options.lanesPerRoad;
          let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
          const carWidth = random(options.carWidthPercentage) * laneWidth;
          laneX += random(options.carShiftX) * laneWidth;
          const offsetY = random(options.carFloorSeparation) + radius * 1.3;
          const offsetZ = -random(options.length);
          aOffset.push(laneX - carWidth/2, offsetY, offsetZ, laneX + carWidth/2, offsetY, offsetZ);
          aMetrics.push(radius, length, speed, radius, length, speed);
          const color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
        instanced.setAttribute("aOffset", new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false));
        instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
        instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
        const material = new THREE.ShaderMaterial({
          fragmentShader: carLightsFragment, vertexShader: carLightsVertex, transparent: true,
          uniforms: Object.assign({ uTime:{value:0}, uTravelLength:{value:options.length}, uFade:{value:this.fade} }, this.webgl.fogUniforms, options.distortion.uniforms),
        });
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace("#include <getDistortion_vertex>", options.distortion.getDistortion);
        };
        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }
      update(time: number) { (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time; }
    }

    class LightsSticks {
      webgl: any; options: any; mesh!: THREE.Mesh;
      constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options; }
      init() {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(1, 1);
        const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any);
        const totalSticks = options.totalSideLightSticks;
        instanced.instanceCount = totalSticks;
        const stickoffset = options.length / (totalSticks - 1);
        const aOffset: number[] = [], aColor: number[] = [], aMetrics: number[] = [];
        let colors = Array.isArray(options.colors.sticks) ? options.colors.sticks.map((c: number) => new THREE.Color(c)) : new THREE.Color(options.colors.sticks);
        for (let i = 0; i < totalSticks; i++) {
          aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
          const color = pickRandom(colors);
          aColor.push(color.r, color.g, color.b);
          aMetrics.push(random(options.lightStickWidth), random(options.lightStickHeight));
        }
        instanced.setAttribute("aOffset", new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false));
        instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
        instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));
        const material = new THREE.ShaderMaterial({
          fragmentShader: sideSticksFragment, vertexShader: sideSticksVertex, side: THREE.DoubleSide,
          uniforms: Object.assign({ uTravelLength:{value:options.length}, uTime:{value:0} }, this.webgl.fogUniforms, options.distortion.uniforms),
        });
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace("#include <getDistortion_vertex>", options.distortion.getDistortion);
        };
        this.mesh = new THREE.Mesh(instanced, material);
        this.mesh.frustumCulled = false;
        this.webgl.scene.add(this.mesh);
      }
      update(time: number) { (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time; }
    }

    class Road {
      webgl: any; options: any; uTime: any; leftRoadWay!: THREE.Mesh; rightRoadWay!: THREE.Mesh; island!: THREE.Mesh;
      constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options; this.uTime = { value: 0 }; }
      createPlane(side: number, _width: number, isRoad: boolean) {
        const options = this.options;
        const geometry = new THREE.PlaneGeometry(isRoad ? options.roadWidth : options.islandWidth, options.length, 20, 100);
        let uniforms: any = {
          uTravelLength: { value: options.length },
          uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) },
          uTime: this.uTime,
        };
        if (isRoad) {
          uniforms = Object.assign(uniforms, {
            uLanes: { value: options.lanesPerRoad },
            uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
            uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
            uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
            uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
            uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage },
          });
        }
        const material = new THREE.ShaderMaterial({
          fragmentShader: isRoad ? roadFragment : islandFragment, vertexShader: roadVertex,
          side: THREE.DoubleSide,
          uniforms: Object.assign(uniforms, this.webgl.fogUniforms, options.distortion.uniforms),
        });
        material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace("#include <getDistortion_vertex>", options.distortion.getDistortion);
        };
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.z = -options.length / 2;
        mesh.position.x += (options.islandWidth / 2 + options.roadWidth / 2) * side;
        this.webgl.scene.add(mesh);
        return mesh;
      }
      init() {
        this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
        this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
        this.island = this.createPlane(0, this.options.islandWidth, false);
      }
      update(time: number) { this.uTime.value = time; }
    }

    class App {
      options: any; container: HTMLElement; renderer!: THREE.WebGLRenderer; composer!: EffectComposer;
      camera!: THREE.PerspectiveCamera; scene!: THREE.Scene; fogUniforms: any; timer!: THREE.Timer;
      assets: any; disposed = false; hasValidSize = false;
      road!: Road; leftCarLights!: CarLights; rightCarLights!: CarLights; leftSticks!: LightsSticks;
      fovTarget = 90; speedUpTarget = 0; speedUp = 0; timeOffset = 0;
      renderPass!: RenderPass; bloomPass!: EffectPass;

      constructor(container: HTMLElement, options: any) {
        this.options = options;
        if (!this.options.distortion) this.options.distortion = { uniforms: distortion_uniforms, getDistortion: distortion_vertex };
        this.container = container;
        const w = Math.max(1, container.offsetWidth), h = Math.max(1, container.offsetHeight);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        const gl = this.renderer.getContext();
        if (gl) {
          const orig = gl.getContextAttributes ? gl.getContextAttributes.bind(gl) : null;
          gl.getContextAttributes = () => {
            const attrs = orig ? orig() : null;
            return attrs || {
              alpha: true,
              antialias: false,
              depth: true,
              stencil: false,
              premultipliedAlpha: false,
              preserveDrawingBuffer: false,
            };
          };
        }
        this.renderer.setSize(w, h, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.composer = new EffectComposer(this.renderer);
        container.append(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(options.fov, w / h, 0.1, 10000);
        this.camera.position.set(0, 8, -5);
        this.scene = new THREE.Scene();
        this.scene.background = null;
        const fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
        this.scene.fog = fog;
        this.fogUniforms = { fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far } };
        this.timer = new THREE.Timer();
        (this.timer as any).connect?.(document);
        this.assets = {};
        this.road = new Road(this, options);
        this.leftCarLights = new CarLights(this, options, options.colors.leftCars, options.movingAwaySpeed, new THREE.Vector2(0, 1 - options.carLightsFade));
        this.rightCarLights = new CarLights(this, options, options.colors.rightCars, options.movingCloserSpeed, new THREE.Vector2(1, 0 + options.carLightsFade));
        this.leftSticks = new LightsSticks(this, options);
        this.fovTarget = options.fov;
        this.tick = this.tick.bind(this);
        this.init = this.init.bind(this);
        this.setSize = this.setSize.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener("resize", this.onWindowResize);
        if (w > 0 && h > 0) this.hasValidSize = true;
      }

      onWindowResize() {
        const w = this.container.offsetWidth, h = this.container.offsetHeight;
        if (w <= 0 || h <= 0) { this.hasValidSize = false; return; }
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(w, h);
        this.hasValidSize = true;
      }

      initPasses() {
        try {
          this.renderPass = new RenderPass(this.scene, this.camera);
          this.bloomPass = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }));
          const smaaPass = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
          // postprocessing v7+: renderToScreen is deprecated — last added pass renders to screen automatically
          this.composer.addPass(this.renderPass);
          this.composer.addPass(this.bloomPass);
          this.composer.addPass(smaaPass);
        } catch (e) {
          console.warn("Hyperspeed postprocessing pass init error:", e);
        }
      }

      loadAssets() { return Promise.resolve(); }

      init() {
        this.initPasses();
        const options = this.options;
        this.road.init();
        this.leftCarLights.init();
        this.leftCarLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2);
        this.rightCarLights.init();
        this.rightCarLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2);
        this.leftSticks.init();
        this.leftSticks.mesh.position.setX(-(options.roadWidth + options.islandWidth / 2));
        this.container.addEventListener("mousedown", this.onMouseDown);
        this.container.addEventListener("mouseup", this.onMouseUp);
        this.container.addEventListener("mouseout", this.onMouseUp);
        this.container.addEventListener("touchstart", this.onTouchStart, { passive: true });
        this.container.addEventListener("touchend", this.onTouchEnd, { passive: true });
        this.container.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
        this.container.addEventListener("contextmenu", this.onContextMenu);
        this.tick();
      }

      onMouseDown(ev: Event) { if (this.options.onSpeedUp) this.options.onSpeedUp(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp; }
      onMouseUp(ev: Event) { if (this.options.onSlowDown) this.options.onSlowDown(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0; }
      onTouchStart(ev: Event) { if (this.options.onSpeedUp) this.options.onSpeedUp(ev); this.fovTarget = this.options.fovSpeedUp; this.speedUpTarget = this.options.speedUp; }
      onTouchEnd(ev: Event) { if (this.options.onSlowDown) this.options.onSlowDown(ev); this.fovTarget = this.options.fov; this.speedUpTarget = 0; }
      onContextMenu(ev: Event) { ev.preventDefault(); }

      update(delta: number) {
        const lerpPct = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPct, 0.00001);
        this.timeOffset += this.speedUp * delta;
        const time = this.timer.getElapsed() + this.timeOffset;
        this.rightCarLights.update(time);
        this.leftCarLights.update(time);
        this.leftSticks.update(time);
        this.road.update(time);
        let updateCamera = false;
        const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPct);
        if (fovChange !== 0) { this.camera.fov += fovChange * delta * 6; updateCamera = true; }
        if (this.options.distortion.getJS) {
          const d = this.options.distortion.getJS(0.025, time);
          this.camera.lookAt(new THREE.Vector3(this.camera.position.x + d.x, this.camera.position.y + d.y, this.camera.position.z + d.z));
          updateCamera = true;
        }
        if (updateCamera) this.camera.updateProjectionMatrix();
      }

      render(delta: number) {
        if (this.composer && (this.composer as any).passes?.length > 0) {
          try {
            this.composer.render(delta);
            return;
          } catch (_) {}
        }
        this.renderer.render(this.scene, this.camera);
      }

      dispose() {
        this.disposed = true;
        this.timer.dispose();
        this.scene?.traverse((obj: any) => {
          if (!obj.isMesh) return;
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material?.dispose();
        });
        this.scene?.clear();
        if (this.renderer) {
          this.renderer.dispose();
          this.renderer.forceContextLoss();
          this.renderer.domElement?.parentNode?.removeChild(this.renderer.domElement);
        }
        this.composer?.dispose();
        window.removeEventListener("resize", this.onWindowResize);
        this.container?.removeEventListener("mousedown", this.onMouseDown);
        this.container?.removeEventListener("mouseup", this.onMouseUp);
        this.container?.removeEventListener("mouseout", this.onMouseUp);
        this.container?.removeEventListener("touchstart", this.onTouchStart);
        this.container?.removeEventListener("touchend", this.onTouchEnd);
        this.container?.removeEventListener("touchcancel", this.onTouchEnd);
        this.container?.removeEventListener("contextmenu", this.onContextMenu);
      }

      setSize(w: number, h: number, updateStyles?: boolean) {
        if (w <= 0 || h <= 0) { this.hasValidSize = false; return; }
        this.composer.setSize(w, h, updateStyles);
        this.hasValidSize = true;
      }

      tick() {
        if (this.disposed) return;
        if (!this.hasValidSize) {
          const w = this.container.offsetWidth, h = this.container.offsetHeight;
          if (w > 0 && h > 0) {
            this.renderer.setSize(w, h, false);
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.composer.setSize(w, h);
            this.hasValidSize = true;
            this.timer.reset();
          } else { requestAnimationFrame(this.tick); return; }
        }
        if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
          const canvas = this.renderer.domElement;
          if (this.hasValidSize) { this.camera.aspect = canvas.clientWidth / canvas.clientHeight; this.camera.updateProjectionMatrix(); }
        }
        if (this.hasValidSize) {
          this.timer.update();
          const delta = this.timer.getDelta();
          this.render(delta);
          this.update(delta);
        }
        requestAnimationFrame(this.tick);
      }
    }

    // ── Bootstrap ─────────────────────────────────────────────────────────
    const container = hyperspeed.current;
    if (!container) return;

    const opts = {
      ...DEFAULT_EFFECT_OPTIONS,
      ...effectOptions,
      colors: {
        ...DEFAULT_EFFECT_OPTIONS.colors,
        ...(effectOptions as any)?.colors,
        ...(lightMode ? { roadColor: 0xffffff, islandColor: 0xf8f7fa, background: 0xffffff, shoulderLines: 0x7c3aed, brokenLines: 0xc084fc } : {}),
      },
    };
    (opts as any).distortion = distortions[(opts as any).distortion] ?? distortions.turbulentDistortion;

    const myApp = new App(container, opts);
    appRef.current = myApp;
    myApp.loadAssets().then(() => myApp.init()).catch((err: any) => {
      console.warn("Hyperspeed WebGL initialization notice:", err);
    });

    return () => {
      appRef.current?.dispose();
      appRef.current = null;
    };
  }, [effectOptions, lightMode]);

  return <div id="lights" ref={hyperspeed} />;
};

export default Hyperspeed;
