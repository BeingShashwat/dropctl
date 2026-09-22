import { useState, type FormEvent } from "react";
import { ArrowRight, FileSearch } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import { navigate } from "../../lib/router";
import { normalizeSlugInput, validateSlug } from "../../lib/config";

export function OpenDropCard({ className }: { className?: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: string) => {
    setValue(next);
    if (error) setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const slug = normalizeSlugInput(value);
    if (!slug) {
      setError("Enter a slug or paste a drop link.");
      return;
    }

    const message = validateSlug(slug);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setValue("");
    navigate(slug);
  };

  return (
    <Card padding="lg" className={className}>
      <CardHeader
        icon={FileSearch}
        title="Open a drop"
        description="Already have a slug? Enter it to view and download that file."
      />

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <Field
          label="Slug"
          htmlFor="open-slug"
          error={error}
          hint="You can paste the full drop link too."
        >
          <TextInput
            id="open-slug"
            name="slug"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            invalid={Boolean(error)}
            placeholder="my-holiday-photos"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="font-mono"
          />
        </Field>

        <Button
          type="submit"
          variant="secondary"
          size="md"
          iconRight={ArrowRight}
          fullWidth
        >
          Open drop
        </Button>
      </form>
    </Card>
  );
}
