import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, Camera, Copy, Check, X, RefreshCw, Smartphone, ShieldCheck } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionCode: string;
  sessionTitle: string;
  onJoinSessionCode: (code: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  sessionCode,
  sessionTitle,
  onJoinSessionCode,
}) => {
  const [activeTab, setActiveTab] = useState<"qr" | "scan">("qr");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>("");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?code=${encodeURIComponent(sessionCode)}`
    : `https://liveq.app/?code=${sessionCode}`;

  // Generate QR Code data URL
  useEffect(() => {
    if (sessionCode) {
      QRCode.toDataURL(joinUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Failed to generate QR code", err));
    }
  }, [sessionCode, joinUrl]);

  // Handle Camera Start/Stop when entering camera tab
  useEffect(() => {
    if (isOpen && activeTab === "scan") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access failed or denied:", err);
      setCameraError("Kamera tidak dapat diakses atau izin ditolak. Anda dapat memasukkan kode sesi secara manual di bawah.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onJoinSessionCode(manualCode.trim().toUpperCase());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-950/60 dark:text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Akses Live Question
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pindai Barcode / QR Code untuk bergabung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === "qr"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Tampilkan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
              activeTab === "scan"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR / Masukkan Kode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "qr" ? (
            <div className="flex flex-col items-center text-center">
              <span className="px-3 py-1 mb-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                Sesi Aktif: {sessionCode}
              </span>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-4">
                {sessionTitle}
              </h4>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-dashed border-indigo-200 dark:border-indigo-900 mb-4 transition-all hover:scale-105">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${sessionCode}`}
                    className="w-56 h-56 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full max-w-sm mb-2">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Arahkan kamera smartphone ke QR Code untuk mengirim pertanyaan langsung.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* Camera Scanner View */}
              <div className="relative w-full h-52 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scanner Target Frame Overlay */}
                    <div className="absolute inset-0 border-2 border-indigo-500/40 flex items-center justify-center">
                      <div className="w-40 h-40 border-2 border-emerald-400 rounded-xl relative animate-pulse">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 text-center text-[10px] text-white/80 bg-slate-900/60 px-3 py-1 rounded-full backdrop-blur">
                      Posisikan QR Code di dalam kotak
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    <Smartphone className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs">{cameraError || "Mengaktifkan kamera..."}</p>
                  </div>
                )}
              </div>

              {/* Manual Input Fallback */}
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Atau Masukkan Kode Sesi Manual:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: INOVASI-2026"
                    className="flex-1 px-3 py-2 text-sm font-mono tracking-wider upper-case bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                  >
                    Gabung Sesi
                  </button>
                </div>
              </form>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Semua sesi terenkripsi dan dapat diikuti tanpa registrasi akun.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
