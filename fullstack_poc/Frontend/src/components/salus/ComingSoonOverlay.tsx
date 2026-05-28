import React, { useEffect, useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

interface ComingSoonOverlayProps {
  onClose?: () => void;
  onGoBack?: () => void;
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  onClose,
  onGoBack,
}) => {
  const router = useRouter();

  // Helper function to calculate time left
  const getTimeLeft = () => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 24);
    launchDate.setHours(launchDate.getHours() + 12);

    const now = new Date().getTime();
    const distance = launchDate.getTime() - now;

    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    // Calculate time until launch (example: 3 days from now)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 24);
    launchDate.setHours(launchDate.getHours() + 12);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn overflow-hidden rounded-2xl">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
            </div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 p-2">
              <img
                src="/images/logoForSalus.png"
                alt="Kofuku Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
            Coming Soon
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-300 mb-3 font-light">
          This chat experience is still being built
        </p>
        <p className="text-sm text-gray-400 mb-8 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Check back shortly
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-3 mb-8 max-w-lg mx-auto">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={item.label}
              className="relative group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-bold text-white mb-1 tabular-nums">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="max-w-sm mx-auto mb-6">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-progress"
              style={{ width: '100%', backgroundSize: '200% 100%' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Development in progress...
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
          {[
            { icon: '🚀', text: 'AI Assistant' },
            { icon: '💬', text: 'Personalized' },
            { icon: '🔒', text: 'Secure' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-[10px] text-gray-300">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Go Back Button */}
        <button
          onClick={() => (onGoBack ? onGoBack() : router.push('/salus'))}
          className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95 mx-auto group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go Back for now!</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes progress {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-progress {
          animation: progress 2s linear infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ComingSoonOverlay;
