import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Copy, ExternalLink, Check } from "lucide-react";

export default function BookingLinkSection({ data, onChange }) {
  const [copied, setCopied] = useState(false);

  const slug = data.booking_slug || "";
  const bookingUrl = `${window.location.origin}/booking/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Slug editor */}
      <div>
        <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-2">
          <Link2 className="w-3.5 h-3.5" />
          Booking Page Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 shrink-0">{window.location.origin}/booking/</span>
          <Input
            value={slug}
            onChange={(e) => onChange("booking_slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            className="rounded-xl border-2 border-gray-100 focus:border-violet-300"
            placeholder="my-salon"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Use letters, numbers, and hyphens only. This is your unique public booking URL.</p>
      </div>

      {/* Generated URL display */}
      {slug && (
        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
          <p className="text-xs font-bold text-violet-600 mb-2">Your Public Booking Link</p>
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-violet-200">
            <span className="text-sm text-gray-600 flex-1 truncate">{bookingUrl}</span>
            <button onClick={handleCopy} className="shrink-0 text-violet-500 hover:text-violet-700 transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button onClick={handleCopy} variant="outline" size="sm"
              className="rounded-xl border-2 border-violet-200 hover:border-violet-400 gap-1.5 flex-1">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" size="sm"
                className="w-full rounded-xl border-2 border-violet-200 hover:border-violet-400 gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Preview Page
              </Button>
            </a>
          </div>
        </div>
      )}

      {!slug && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
          <p className="text-sm text-gray-400">Enter a slug above to generate your public booking link.</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-4 border border-violet-100">
        <h3 className="text-sm font-bold text-gray-700 mb-2">How it works</h3>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Set your booking slug and save settings</li>
          <li>Share the booking link with your clients</li>
          <li>Clients pick a service, date, time, and fill in their info</li>
          <li>You receive the request as a <strong>Pending</strong> appointment</li>
          <li>Accept or reject it from your dashboard</li>
        </ol>
      </div>
    </div>
  );
}