"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Code,
  Star,
  GitFork,
  Users,
  Calendar,
  FileText,
  Download
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import Link from "next/link";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Merge Requests", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Commits récents", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

const projectData = {
  id: "constitution-v3",
  name: "Constitution v3.0",
  description: "Révision majeure de la constitution avec nouveaux articles sur l'IA et les droits numériques. Ce projet collaboratif vise à adapter notre cadre juridique aux défis du 21ème siècle.",
  language: "Markdown",
  stars: 247,
  forks: 45,
  watchers: 89,
  contributors: 34,
  license: "CC BY-SA 4.0",
  created: "2023-09-15",
  lastUpdate: "il y a 2h",
};

const branches = [
  { name: "main", commits: 247, lastUpdate: "il y a 2h", protected: true },
  { name: "feature/ai-ethics", commits: 15, lastUpdate: "il y a 3h", protected: false },
  { name: "feature/digital-rights", commits: 23, lastUpdate: "il y a 1j", protected: false },
  { name: "fix/article-9-typos", commits: 3, lastUpdate: "il y a 2j", protected: false },
];

const recentCommits = [
  {
    hash: "a3f2b1c",
    message: "Add article 47: AI Ethics and Governance",
    author: "Marie Dupont",
    date: "il y a 2h",
    branch: "feature/ai-ethics",
  },
  {
    hash: "d4e5f6g",
    message: "Update article 12: Digital Privacy Rights",
    author: "Jean Martin",
    date: "il y a 5h",
    branch: "feature/digital-rights",
  },
  {
    hash: "h7i8j9k",
    message: "Fix typos in article 9",
    author: "Sophie Chen",
    date: "il y a 1j",
    branch: "fix/article-9-typos",
  },
];

const openMRs = [
  {
    id: "mr-1",
    number: 42,
    title: "Ajout article 47 sur l'IA éthique",
    author: "Marie Dupont",
    status: "open",
    votes: { approve: 12, reject: 2 },
    created: "il y a 3h",
    branch: "feature/ai-ethics",
  },
  {
    id: "mr-2",
    number: 41,
    title: "Mise à jour droits numériques",
    author: "Jean Martin",
    status: "review",
    votes: { approve: 8, reject: 1 },
    created: "il y a 1j",
    branch: "feature/digital-rights",
  },
];

const contributors = [
  { name: "Marie Dupont", commits: 67, avatar: "MD" },
  { name: "Jean Martin", commits: 52, avatar: "JM" },
  { name: "Sophie Chen", commits: 45, avatar: "SC" },
  { name: "Alex Rivera", commits: 38, avatar: "AR" },
];

export default function ProjectDetailPage() {
  const params = useParams();

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-6">
        <Link href="/forge">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-5 w-5 text-violet-500" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {projectData.name}
              </h1>
              <Badge variant="green">Public</Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3 max-w-2xl">
              {projectData.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {projectData.stars} stars
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {projectData.forks} forks
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {projectData.contributors} contributeurs
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Mis à jour {projectData.lastUpdate}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Star className="h-4 w-4" />
              Star
            </Button>
            <Button variant="secondary">
              <GitFork className="h-4 w-4" />
              Fork
            </Button>
            <Button variant="primary">
              <Download className="h-4 w-4" />
              Clone
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="code" className="mb-6">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="mrs">Merge Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* File Browser */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <select className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm">
                        <option>main</option>
                        <option>feature/ai-ethics</option>
                        <option>feature/digital-rights</option>
                      </select>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      247 commits
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {[
                      { name: "README.md", type: "file", size: "2.4 KB" },
                      { name: "CONTRIBUTING.md", type: "file", size: "1.8 KB" },
                      { name: "articles/", type: "dir", items: 47 },
                      { name: "propositions/", type: "dir", items: 12 },
                      { name: "LICENSE", type: "file", size: "1.1 KB" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-[var(--bg-elevated)] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {item.type === "dir" ? (
                            <FileText className="h-4 w-4 text-violet-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                          )}
                          <span className="text-sm text-[var(--text-primary)]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {item.type === "dir" ? `${item.items} items` : item.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* README Preview */}
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>README.md</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                      Constitution VITA v3.0
                    </h2>
                    <p className="mb-3">
                      Ce projet collaboratif vise à créer la prochaine version majeure de la Constitution VITA,
                      intégrant les nouveaux défis liés à l'intelligence artificielle et aux droits numériques.
                    </p>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2">
                      Comment contribuer
                    </h3>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Forker le projet</li>
                      <li>Créer une branche pour votre contribution</li>
                      <li>Soumettre une Merge Request</li>
                      <li>Participer aux discussions</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Langage</div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-cyan-500" />
                        <span className="text-[var(--text-primary)]">{projectData.language}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Licence</div>
                      <div className="text-[var(--text-primary)]">{projectData.license}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Créé le</div>
                      <div className="text-[var(--text-primary)]">{projectData.created}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle>Contributeurs ({projectData.contributors})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contributors.map((contributor, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                            {contributor.avatar}
                          </div>
                          <span className="text-sm text-[var(--text-primary)]">
                            {contributor.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {contributor.commits} commits
                        </span>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-sm">
                      Voir tous les contributeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="commits" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Commits récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCommits.map((commit, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                          {commit.message}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>{commit.author}</span>
                          <span>•</span>
                          <span className="font-mono">{commit.hash}</span>
                          <span>•</span>
                          <Badge variant="violet" className="text-xs">{commit.branch}</Badge>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{commit.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Branches ({branches.length})</CardTitle>
              <Button variant="primary" size="sm">
                <GitBranch className="h-4 w-4" />
                Nouvelle branche
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {branches.map((branch, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-violet-500" />
                        <span className="font-semibold text-sm text-[var(--text-primary)]">
                          {branch.name}
                        </span>
                        {branch.protected && (
                          <Badge variant="orange" className="text-xs">Protégée</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        <span>{branch.commits} commits</span>
                        <span>•</span>
                        <span>{branch.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mrs" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Merge Requests ouvertes ({openMRs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {openMRs.map((mr) => (
                  <Link key={mr.id} href={`/forge/mr/${mr.id}`}>
                    <div className="p-4 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GitPullRequest className="h-4 w-4 text-violet-500" />
                            <span className="font-semibold text-[var(--text-primary)]">
                              #{mr.number} {mr.title}
                            </span>
                            <Badge variant={mr.status === 'review' ? 'orange' : 'green'}>
                              {mr.status === 'review' ? 'En révision' : 'Ouvert'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span>par {mr.author}</span>
                            <span>•</span>
                            <span>{mr.created}</span>
                            <span>•</span>
                            <Badge variant="violet" className="text-xs">{mr.branch}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-green-500">✓ {mr.votes.approve}</span>
                          <span className="text-pink-500">✗ {mr.votes.reject}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
