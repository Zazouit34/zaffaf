"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current device is a mobile device based on screen width
 * @returns A boolean indicating if the current device is a mobile device
 */
export function useIsMobile(): boolean {
  // Default to false (desktop) to ensure server-side rendering works correctly
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the window width is below the mobile threshold
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile devices
    };

    // Check immediately on component mount
    checkIsMobile();

    // Add event listener to check when window is resized
    window.addEventListener("resize", checkIsMobile);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return isMobile;
} 