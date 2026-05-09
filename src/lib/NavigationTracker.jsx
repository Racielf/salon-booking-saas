import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
    const location = useLocation();

    // Post navigation changes to parent window (used by embedding iframes)
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    // Note: base44.appLogs removed (Phase 6 cleanup - no Supabase equivalent needed)
    return null;
}