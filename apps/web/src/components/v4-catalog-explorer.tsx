"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Filter, Layers, Search } from "lucide-react";
import {
  V4_PRODUCTION_STATE_LABELS,
  V4_PRODUCTION_STATES,
  type V4ProductionState,
} from "@cyber-school/lesson-runtime";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cyber-school/ui";
import type { V4ExplorerData } from "@/lib/v4-catalog";

export function V4CatalogExplorer({ data }: { data: V4ExplorerData }) {
  const [selectedDomain, setSelectedDomain] = React.useState<string>("all");
  const [selectedState, setSelectedState] = React.useState<string>("all");
  const [eligibleOnly, setEligibleOnly] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState<string>("");
  const [expandedUnitIds, setExpandedUnitIds] = React.useState<Record<string, boolean>>({});

  const normalizedQuery = query.trim().toLowerCase();

  const filteredUnits = React.useMemo(() => {
    return data.units.filter((u) => {
      if (selectedDomain !== "all" && u.domainId !== selectedDomain) return false;
      if (selectedState !== "all" && u.state !== selectedState) return false;
      if (eligibleOnly && !u.eligibleNow) return false;
      if (normalizedQuery) {
        const hay = `${u.unitId} ${u.moduleId} ${u.title} ${u.moduleTitle} ${u.microLessons
          .map((m) => `${m.id} ${m.title}`)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [data.units, eligibleOnly, normalizedQuery, selectedDomain, selectedState]);

  function toggleExpanded(unitId: string) {
    setExpandedUnitIds((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  }

  return (
    <div className="space-y-8" data-testid="v4-catalog-explorer">
      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Micro-leçons V4 indexées</CardDescription>
            <CardTitle className="text-2xl font-bold" data-testid="v4-kpi-micro">
              {data.totalMicroLessons}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {data.totalModules} modules · {data.totalCompetencies} compétences · {data.totalExams}{" "}
            examens
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unités pédagogiques</CardDescription>
            <CardTitle className="text-2xl font-bold" data-testid="v4-kpi-units">
              {data.totalUnits}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Couverture à 100 % des micro-leçons sans doublons ni oublis
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prochains lots éligibles</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary" data-testid="v4-kpi-eligible">
              {data.eligibleUnitsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Unités prêtes à être planifiées ou produites (prérequis satisfaits)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Couverture active / en revue</CardDescription>
            <CardTitle className="text-2xl font-bold" data-testid="v4-kpi-covered">
              {data.coveredOrInReviewCount} / {data.totalMicroLessons}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Suivi d&apos;avancement vérifiable par livrables et tests
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Explorer et filtrer le cursus V4</CardTitle>
            </div>
            <Badge variant="outline" data-testid="v4-filtered-count">
              {filteredUnits.length} / {data.totalUnits} unités affichées
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.5fr,1fr,auto]">
            <label className="relative block">
              <span className="sr-only">Rechercher une unité ou micro-leçon</span>
              <Search
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (ex: TC00.005, causalité, heap, OSINT...)"
                data-testid="v4-search-input"
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <label className="block">
              <span className="sr-only">Filtrer par état de production</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                data-testid="v4-state-select"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Tous les états (12 états)</option>
                {V4_PRODUCTION_STATES.map((st: V4ProductionState) => (
                  <option key={st} value={st}>
                    {V4_PRODUCTION_STATE_LABELS[st]}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              size="sm"
              variant={eligibleOnly ? "default" : "outline"}
              data-testid="v4-eligible-toggle"
              onClick={() => setEligibleOnly((v) => !v)}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Lots éligibles uniquement
            </Button>
          </div>

          {/* Domain Pills */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Domaines du cursus V4">
            <Button
              type="button"
              size="sm"
              variant={selectedDomain === "all" ? "default" : "outline"}
              data-testid="v4-domain-all"
              onClick={() => setSelectedDomain("all")}
            >
              Tous les domaines ({data.totalUnits})
            </Button>
            {data.domains.map((domain) => (
              <Button
                key={domain.id}
                type="button"
                size="sm"
                variant={selectedDomain === domain.id ? "default" : "outline"}
                data-testid={`v4-domain-${domain.id}`}
                onClick={() => setSelectedDomain(domain.id)}
              >
                {domain.title.split("—")[0]?.trim()} ({domain.unitsCount})
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Units List */}
      <div className="grid gap-4">
        {filteredUnits.slice(0, 48).map((unit) => {
          const isExpanded = Boolean(expandedUnitIds[unit.unitId]);
          const stateLabel = V4_PRODUCTION_STATE_LABELS[unit.state];

          return (
            <Card key={unit.unitId} data-testid={`v4-unit-card-${unit.unitId}`}>
              <CardHeader className="space-y-2 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {unit.moduleId}
                    </Badge>
                    <Badge
                      variant={
                        unit.state === "valide" || unit.state === "publie"
                          ? "success"
                          : unit.state === "revue_necessaire"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {stateLabel}
                    </Badge>
                    {unit.eligibleNow && (
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        Éligible maintenant
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {unit.microLessons.length} micro-leçons · ~{unit.estimatedMinutes} min ·{" "}
                    {unit.recommendedMedium}
                  </span>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{unit.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Unité <code className="font-mono">{unit.unitId}</code> · {unit.domainTitle}
                      {unit.prerequisiteUnitIds.length > 0 &&
                        ` · Prérequis : ${unit.prerequisiteUnitIds.join(", ")}`}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {unit.lessonSlug && (
                      <Link
                        href={`/lessons/${unit.lessonSlug}`}
                        data-testid={`v4-open-lesson-${unit.lessonSlug}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        Ouvrir le cours
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-expanded={isExpanded}
                      data-testid={`v4-expand-${unit.unitId}`}
                      onClick={() => toggleExpanded(unit.unitId)}
                    >
                      <Layers className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {isExpanded ? "Masquer les micro-leçons" : "Voir les micro-leçons"}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t pt-3">
                  <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
                    {unit.microLessons.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-start justify-between gap-2 rounded border bg-muted/30 px-2.5 py-1.5"
                      >
                        <span>
                          <strong className="font-mono text-foreground">{m.id}</strong> — {m.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          L.{m.provenanceLine} · {m.coverageState}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          );
        })}

        {filteredUnits.length > 48 && (
          <p className="text-center text-xs text-muted-foreground">
            Affichage limité aux 48 premières unités correspondantes ({filteredUnits.length} au
            total). Affinez votre recherche ou filtre par domaine pour cibler un module.
          </p>
        )}
      </div>
    </div>
  );
}
