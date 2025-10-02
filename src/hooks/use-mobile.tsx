"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT;
      // A device is considered mobile if it has touch AND a narrow screen,
      // or just has touch (covers iPads etc. that aren't narrow)
      // This is a more reliable check than just screen width.
      setIsMobile(isTouchDevice || isNarrowScreen);
    }

    checkDevice(); // Check on initial mount

    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return isMobile
}
