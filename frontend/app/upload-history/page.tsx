"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedResults, SavedResult } from "@/store/useSavedResults";
import {
  ArrowLeft,
  Clock,
  Search,
  Trash2,
  Eye,
  Mail,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadHistoryPage() {
  const router = useRouter();
  const { results, loadResults, removeResult, clearAll } = useSavedResults();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadResults();
  }, [loadResults]);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              Analysis History
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "link":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "critical":
      case "high":
        return "text-red-600 dark:text-red-400 font-bold";
      case "suspicious":
      case "gray":
        return "text-orange-600 dark:text-orange-400";
      case "safe":
        return "text-green-600 dark:text-green-400 font-bold";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const getSummary = (result: SavedResult) => {
    const text = result.inputText.substring(0, 80);
    return text.length < result.inputText.length ? text + "..." : text;
  };

  const handleViewResult = (id: string) => {
    const saved = results.find((r) => r.id === id);
    if (saved) {
      sessionStorage.setItem("viewResult", JSON.stringify(saved));
      router.push(`/results?savedId=${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              Analysis History
            </h1>
            <p className="text-muted-foreground">
              Your saved fraud analysis results
            </p>
          </div>
        </div>
        {results.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  "Clear all saved results? This cannot be undone.",
                )
              ) {
                clearAll();
              }
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Saved Results Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start analyzing content and click "Save Result" to track your fraud
            detections.
          </p>
          <Link href="/analyze">
            <Button className="gradient-button">
              <Search className="w-4 h-4 mr-2" />
              Start Analyzing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Search className="w-4 h-4" /> {results.length} Saved Analyses
            </h3>
          </div>

          <div className="divide-y divide-border">
            {results.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-background transition-colors flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {getSummary(item)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)} •{" "}
                      <span className="uppercase">{item.type}</span> Analysis
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div
                    className={`text-sm font-medium ${getRiskColor(item.riskLevel)}`}
                  >
                    {item.riskLevel}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {item.riskScore}/100
                  </div>
                  <button
                    onClick={() => handleViewResult(item.id)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="View detailed analysis"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this result?")) {
                        removeResult(item.id);
                      }
                    }}
                    className="p-2 hover:bg-red-600/10 rounded-lg transition-colors"
                    title="Delete this result"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Analysis history is stored locally on your device for privacy. <br />
          <span className="text-xs">
            Clearing browser data or using private mode will remove saved
            results.
          </span>
        </p>
      </div>
    </div>
  );
}
