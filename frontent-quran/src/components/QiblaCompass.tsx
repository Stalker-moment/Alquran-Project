"use client";

import React, { useEffect, useState } from "react";
import { FaCompass, FaLocationArrow, FaMobileAlt, FaRedo } from "react-icons/fa";
import { calculateQiblaDirection } from "@/utils/qibla";
import { useLanguage } from "@/context/LanguageContext";

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
}

export default function QiblaCompass({ latitude, longitude }: QiblaCompassProps) {
  const { t, language } = useLanguage();
  const [qiblaAngle, setQiblaAngle] = useState<number>(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState<boolean>(false);
  const [iosPermission, setIosPermission] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  
  // Desktop manual heading simulation state
  const [simulatedHeading, setSimulatedHeading] = useState<number>(0);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);

  useEffect(() => {
    // Calculate Qibla bearing when coordinate changes
    const angle = calculateQiblaDirection(latitude, longitude);
    setQiblaAngle(angle);
  }, [latitude, longitude]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(ios);

    // Compass check
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Standard or webkitCompassHeading
      const compassHeading = (e as any).webkitCompassHeading || e.alpha;
      
      if (compassHeading !== undefined && compassHeading !== null) {
        setHasCompass(true);
        setIsSimulated(false);
        
        // If webkitCompassHeading exists, use it directly (accurate True North)
        if ((e as any).webkitCompassHeading !== undefined) {
          setHeading((e as any).webkitCompassHeading);
        } else if (e.absolute) {
          // If absolute orientation is supported (mostly Android Chrome)
          // e.alpha increases counter-clockwise, compass heading increases clockwise from North
          const absoluteHeading = (360 - (e.alpha || 0)) % 360;
          setHeading(absoluteHeading);
        } else {
          // Fallback alpha check
          setHeading(e.alpha);
        }
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    
    // Check if absolute events are available (Android Chrome)
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
    };
  }, []);

  const requestCompassPermission = async () => {
    if (typeof window === "undefined") return;

    const DeviceOrientationEventClass = (window as any).DeviceOrientationEvent;
    
    if (
      DeviceOrientationEventClass &&
      typeof DeviceOrientationEventClass.requestPermission === "function"
    ) {
      try {
        const response = await DeviceOrientationEventClass.requestPermission();
        if (response === "granted") {
          setIosPermission(true);
          setHasCompass(true);
          setIsSimulated(false);
        }
      } catch (err) {
        console.error("iOS compass permission denied:", err);
      }
    } else {
      // Non-iOS or no permission required
      setIosPermission(true);
      setHasCompass(true);
      setIsSimulated(false);
    }
  };

  const activeHeading = isSimulated ? simulatedHeading : (heading || 0);
  
  // Calculate relative angle of Makkah from user perspective:
  // e.g. if Kaaba is at 295 deg and device is facing 95 deg, Kaaba is at 200 deg relative to device heading
  const relativeKaabaAngle = (qiblaAngle - activeHeading + 360) % 360;
  
  // Checking alignment within 3 degrees
  const isAligned = Math.abs(relativeKaabaAngle) <= 3 || Math.abs(relativeKaabaAngle - 360) <= 3;

  // Trigger vibration if aligned
  useEffect(() => {
    if (isAligned && typeof navigator !== "undefined" && "vibrate" in navigator && !isSimulated) {
      navigator.vibrate([80]);
    }
  }, [isAligned, isSimulated]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 sm:p-8 rounded-3xl border border-card-border bg-card-bg/60 shadow-xl backdrop-blur-md relative overflow-hidden">
      
      {/* Glow Effect when aligned */}
      <div
        className={`absolute inset-0 -z-10 transition-opacity duration-700 blur-3xl opacity-20 bg-linear-to-tr ${
          isAligned ? "from-emerald-500/30 to-teal-500/20" : "from-primary/10 to-transparent"
        }`}
      />

      <div className="text-center space-y-1 select-none">
        <h3 className="font-extrabold text-foreground text-lg sm:text-xl flex items-center justify-center gap-2">
          <FaCompass className={`h-5 w-5 ${isAligned ? "text-emerald-500 animate-pulse" : "text-primary"}`} />
          {t("qiblaTitle")}
        </h3>
        <p className="text-xs text-muted max-w-sm leading-relaxed">
          {t("qiblaCompassTips")}
        </p>
      </div>

      {/* Compass UI */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center rounded-full border border-card-border bg-background/40 shadow-inner select-none">
        
        {/* Cardinal points outer ring (rotates according to activeHeading) */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `rotate(-${activeHeading}deg)` }}
        >
          {/* North */}
          <span className="absolute top-3.5 text-xs font-black text-rose-500">N</span>
          {/* East */}
          <span className="absolute right-3.5 text-xs font-black text-foreground">E</span>
          {/* South */}
          <span className="absolute bottom-3.5 text-xs font-black text-foreground">S</span>
          {/* West */}
          <span className="absolute left-3.5 text-xs font-black text-foreground">W</span>

          {/* Dial Marks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute w-full h-full flex items-center justify-center"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className={`h-2 w-0.5 ${deg % 90 === 0 ? "bg-foreground/45 h-3" : "bg-card-border"}`} style={{ transform: "translateY(-120px)" }} />
            </div>
          ))}
        </div>

        {/* Central Dial Ring */}
        <div className="absolute w-44 h-44 rounded-full border border-card-border/80 bg-card-bg/50 shadow-md flex items-center justify-center">
          
          {/* Makkah Pointer Needle (points to relativeKaabaAngle) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${relativeKaabaAngle}deg)` }}
          >
            {/* Kaaba Arrow Pointer */}
            <div className="absolute top-0 flex flex-col items-center justify-center" style={{ transform: "translateY(-56px)" }}>
              <FaLocationArrow
                className={`h-7 w-7 rotate-45 transition-colors duration-300 drop-shadow-md ${
                  isAligned ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-primary"
                }`}
              />
              <span className="text-[10px] font-black text-foreground mt-1 tracking-widest bg-background/90 px-1.5 py-0.5 rounded-md border border-card-border shadow-xs">KAABA</span>
            </div>
          </div>

          {/* Central status / alignment check */}
          <div className="text-center z-10 select-none">
            {isAligned ? (
              <span className="text-[10px] font-black tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full animate-pulse">
                {t("qiblaAligned")}
              </span>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-black font-mono text-foreground leading-none">
                  {relativeKaabaAngle.toFixed(0)}°
                </span>
                <span className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1 block">
                  {relativeKaabaAngle > 180 ? (language === "id" ? "Kiri" : "Turn Left") : (language === "id" ? "Kanan" : "Turn Right")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic compass orientation indicator */}
        <div className="absolute -top-3 h-6 w-6 bg-primary border-4 border-background rounded-full shadow-md flex items-center justify-center">
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
        </div>
      </div>

      {/* Info Stats Row */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm select-none border-t border-card-border/60 pt-4.5">
        <div className="text-center">
          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block">{t("qiblaHeading")}</span>
          <span className="text-sm font-black font-mono text-foreground">{activeHeading.toFixed(0)}°</span>
        </div>
        <div className="text-center border-l border-card-border">
          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider block">{t("qiblaAngle")}</span>
          <span className="text-sm font-black font-mono text-primary">{qiblaAngle.toFixed(0)}°</span>
        </div>
      </div>

      {/* Sensor Enable / Calibration / Fallback Notice Panel */}
      <div className="w-full max-w-sm text-center">
        {isIos && !iosPermission && (
          <button
            onClick={requestCompassPermission}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-3.5 transition-all shadow-md shadow-primary-glow cursor-pointer"
          >
            <FaMobileAlt />
            <span>{t("qiblaCalibrate")}</span>
          </button>
        )}

        {isSimulated && (
          <div className="space-y-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/25">
            <p className="text-[10px] text-amber-500 font-bold leading-normal">
              ⚠️ {t("qiblaNotSupported")}
            </p>
            
            {/* Compass Heading Slider for Simulation on Desktop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase select-none">
                <span>Simulasi Arah Kompas</span>
                <span className="font-mono text-foreground">{simulatedHeading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={simulatedHeading}
                onChange={(e) => setSimulatedHeading(parseInt(e.target.value))}
                className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="block text-[9px] text-muted italic">
                (Geser slider untuk mensimulasikan putaran perangkat laptop/desktop)
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
