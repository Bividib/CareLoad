type RoutePlaceholderProps = {
  title: string;
  description: string;
};

export function RoutePlaceholder({
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white px-6 py-10 shadow-sm">
      <div className="mb-10 text-xl font-bold tracking-tight text-[var(--navy-950)]">
        CareLoad
      </div>
      <div className="my-auto rounded-3xl border border-[var(--grey-300)] bg-[var(--grey-50)] p-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--teal-600)]">
          Foundation placeholder
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-base leading-7 text-[var(--grey-500)]">
          {description}
        </p>
      </div>
      <p className="mt-10 text-sm leading-6 text-[var(--grey-500)]">
        Hackathon prototype using synthetic information. Not a medical device
        and not for real patient care.
      </p>
    </main>
  );
}

