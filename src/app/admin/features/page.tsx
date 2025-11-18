"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Save } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface FeatureConfig {
  id: string;
  featureCode: string;
  primaryProvider?: Provider;
  secondaryProvider?: Provider;
  tertiaryProvider?: Provider;
  settings?: any;
}

const FEATURES = [
  { code: "STUDY_PLAN", name: "Study Plan Generator" },
  { code: "MOCK_TEST", name: "Mock Test Generator" },
  { code: "DOUBT_CHAT", name: "Doubt Chat" },
  { code: "NOTES_GENERATOR", name: "Notes Generator" },
];

function FeatureConfigCard({
  feature,
  config,
  providers,
  onSave,
  saving,
}: {
  feature: { code: string; name: string };
  config?: FeatureConfig;
  providers: Provider[];
  onSave: (code: string, config: Partial<FeatureConfig>) => Promise<void>;
  saving: boolean;
}) {
  const [primaryId, setPrimaryId] = useState(
    config?.primaryProvider?.id || ""
  );
  const [secondaryId, setSecondaryId] = useState(
    config?.secondaryProvider?.id || ""
  );
  const [tertiaryId, setTertiaryId] = useState(
    config?.tertiaryProvider?.id || ""
  );

  // Update state when config changes
  useEffect(() => {
    setPrimaryId(config?.primaryProvider?.id || "");
    setSecondaryId(config?.secondaryProvider?.id || "");
    setTertiaryId(config?.tertiaryProvider?.id || "");
  }, [config]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{feature.name}</CardTitle>
        <CardDescription>Feature Code: {feature.code}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`primary-${feature.code}`}>
              Primary Provider
            </Label>
            <Select
              id={`primary-${feature.code}`}
              value={primaryId}
              onChange={(e) => setPrimaryId(e.target.value)}
            >
              <option value="">Select primary provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} ({provider.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`secondary-${feature.code}`}>
              Secondary Provider (Optional)
            </Label>
            <Select
              id={`secondary-${feature.code}`}
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
            >
              <option value="">No secondary provider</option>
              {providers
                .filter((p) => p.id !== primaryId && p.id !== tertiaryId)
                .map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.code})
                  </option>
                ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tertiary-${feature.code}`}>
              Tertiary Provider (Optional)
            </Label>
            <Select
              id={`tertiary-${feature.code}`}
              value={tertiaryId}
              onChange={(e) => setTertiaryId(e.target.value)}
            >
              <option value="">No tertiary provider</option>
              {providers
                .filter((p) => p.id !== primaryId && p.id !== secondaryId)
                .map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.code})
                  </option>
                ))}
            </Select>
          </div>
        </div>

        <Button
          onClick={() =>
            onSave(feature.code, {
              primaryProviderId: primaryId || null,
              secondaryProviderId: secondaryId || null,
              tertiaryProviderId: tertiaryId || null,
            })
          }
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>

        {config && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <p className="font-medium">Current Configuration:</p>
            <p>
              Primary:{" "}
              {config.primaryProvider
                ? `${config.primaryProvider.name} (${config.primaryProvider.code})`
                : "Not set"}
            </p>
            <p>
              Secondary:{" "}
              {config.secondaryProvider
                ? `${config.secondaryProvider.name} (${config.secondaryProvider.code})`
                : "Not set"}
            </p>
            <p>
              Tertiary:{" "}
              {config.tertiaryProvider
                ? `${config.tertiaryProvider.name} (${config.tertiaryProvider.code})`
                : "Not set"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FeaturesPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [features, setFeatures] = useState<FeatureConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [providersRes, featuresRes] = await Promise.all([
        fetch("/api/admin/providers"),
        fetch("/api/admin/features"),
      ]);

      const providersData = await providersRes.json();
      const featuresData = await featuresRes.json();

      setProviders(providersData.providers || []);
      setFeatures(featuresData.features || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureConfig = (featureCode: string): FeatureConfig | undefined => {
    return features.find((f) => f.featureCode === featureCode);
  };

  const handleSave = async (featureCode: string, config: Partial<FeatureConfig>) => {
    setSaving({ ...saving, [featureCode]: true });
    try {
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureCode,
          ...config,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to save configuration");
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error saving feature config:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving({ ...saving, [featureCode]: false });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  const activeProviders = providers.filter((p) => p.status === "active");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Configuration</h1>
          <p className="mt-2 text-gray-600">
            Configure AI providers for each feature with primary, secondary, and tertiary
            failover
          </p>
        </div>

        <div className="space-y-6">
          {FEATURES.map((feature) => {
            const config = getFeatureConfig(feature.code);
            return (
              <FeatureConfigCard
                key={feature.code}
                feature={feature}
                config={config}
                providers={activeProviders}
                onSave={handleSave}
                saving={saving[feature.code] || false}
              />
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
