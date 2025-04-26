import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui";

const ResultCard = ({ result, onReset }) => {
  const [percentageDisplay, setPercentageDisplay] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  // Safely get result properties with defaults
  const safeResult = {
    percentage: result?.percentage || 0,
    status: result?.status || "Status unavailable",
    message: result?.message || "No prediction message available"
  };

  useEffect(() => {
    if (!result) {
      setError("No result data available");
      return;
    }

    // Animate the percentage counter
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      try {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPercentage = Math.floor(progress * safeResult.percentage);
        
        setPercentageDisplay(currentPercentage);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      } catch (err) {
        console.error("Animation error:", err);
        setPercentageDisplay(safeResult.percentage);
      }
    };
    
    animate();
  }, [safeResult.percentage]);

  const shareResult = async () => {
    try {
      const shareText = `According to Uko Single Predictor, I'm ${percentageDisplay}% single! ${safeResult.message}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Single Status',
          text: shareText,
          url: window.location.href
        });
      } else {
        await copyToClipboard(shareText);
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      await copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Failed to copy to clipboard");
    }
  };

  const getPercentageColor = () => {
    const percentage = safeResult.percentage;
    if (percentage < 30) return 'text-green-600';
    if (percentage < 70) return 'text-yellow-500';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-red-600 font-medium">{error}</div>
        <Button onClick={onReset} variant="outline" className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`text-6xl font-bold text-center ${getPercentageColor()}`}>
        {percentageDisplay}%
      </div>
      
      <h2 className="text-2xl font-semibold text-center">
        {safeResult.status.replace(String(safeResult.percentage), String(percentageDisplay))}
      </h2>
      
      <div className="bg-pink-50 p-4 rounded-lg">
        <p className="text-gray-800 italic">"{safeResult.message}"</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={shareResult}
          variant={isCopied ? 'secondary' : 'primary'}
          className="flex items-center justify-center gap-2"
          disabled={!safeResult}
        >
          {isCopied ? 'Copied!' : 'Share'}
        </Button>
        
        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ResultCard;