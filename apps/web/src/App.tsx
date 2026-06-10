import { Button } from "@/components/ui/button";

function App() {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-6 py-16">
      <section className="w-full max-w-2xl space-y-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Local trophy companion
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Platinum Tracker
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          Create game guides and track every collectible on the way to your next
          platinum trophy.
        </p>
        <Button size="lg">Create your first guide</Button>
      </section>
    </main>
  );
}

export default App;
