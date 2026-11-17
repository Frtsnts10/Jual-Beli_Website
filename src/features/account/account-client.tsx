"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut, Star } from "lucide-react";
import { sendEmailVerification, signInWithEmailAndPassword, signOut, verifyBeforeUpdateEmail, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { Stars } from "@/components/stars";
import { authError, inputCls } from "./auth-forms";
import { cancelAccountDeletion, claimFromAccount, requestAccountDeletion, submitReview, updateProfile, type FormState } from "./actions";
import { btnDanger, btnDangerOutline, btnOutline, btnPrimary, textarea } from "@/lib/ui";

const primary = btnPrimary;
const outline = btnOutline;

export function AccountTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
      {tabs.map((t, i) => {
        // The first tab (Pesanan) is the section root, so match it exactly.
        const active = i === 0 ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap",
              active ? "border-[var(--accent)] text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SignOutButton({ homeHref }: { homeHref: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={outline}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/session", { method: "DELETE" });
        await signOut(auth).catch(() => {});
        window.location.assign(homeHref);
      }}
    >
      <LogOut className="size-4" /> Keluar
    </button>
  );
}

export function VerifyEmailBanner() {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  return (
    <div className="rounded-[var(--r-inner)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Email Anda belum diverifikasi. Verifikasi agar pesanan lama dengan email ini ikut tampil.{" "}
      {state === "sent" ? (
        <span className="font-medium">Link verifikasi terkirim — cek email Anda, lalu muat ulang halaman ini.</span>
      ) : (
        <button
          type="button"
          className="font-semibold underline underline-offset-4"
          onClick={async () => {
            const user = auth.currentUser;
            if (!user) return setState("error");
            await sendEmailVerification(user).then(() => setState("sent"), () => setState("error"));
          }}
        >
          Kirim ulang link verifikasi
        </button>
      )}
      {state === "error" && <span className="block pt-1">Gagal mengirim. Keluar lalu masuk lagi, kemudian coba kembali.</span>}
    </div>
  );
}

function Feedback({ state, ok }: { state: FormState; ok: string }) {
  if (state?.error) return <p className="rounded-[var(--r-inner)] bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  if (state?.ok) return <p className="rounded-[var(--r-inner)] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{ok}</p>;
  return null;
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        Nama
        <input name="name" required minLength={2} defaultValue={name} autoComplete="name" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Nomor WhatsApp
        <input name="phone" type="tel" inputMode="tel" defaultValue={phone.replace(/^\+?62/, "0")} placeholder="0812xxxxxxxx" autoComplete="tel" className={inputCls} />
        <span className="text-xs font-normal text-neutral-500">Dipakai otomatis saat checkout; akun premium dikirim ke nomor ini.</span>
      </label>
      <Feedback state={state} ok="Profil disimpan." />
      <button disabled={pending} className={cn(primary, "w-fit")}>
        {pending && <Loader2 className="size-4 animate-spin" />} Simpan profil
      </button>
    </form>
  );
}

export function ClaimForm({ storeKey, orderId }: { storeKey: string; orderId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(claimFromAccount.bind(null, storeKey), undefined);
  if (state?.ok) return <p className="rounded-[var(--r-inner)] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Klaim terkirim. Penjual akan mengganti akun Anda secepatnya.</p>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-semibold text-red-600 hover:underline">
        Klaim garansi / lapor masalah
      </button>
    );
  }
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      <textarea name="reason" required minLength={10} rows={3} placeholder="Contoh: password tidak bisa dipakai login sejak tadi pagi" className={textarea} />
      <Feedback state={state} ok="" />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className={btnDangerOutline}>
          {pending && <Loader2 className="size-4 animate-spin" />} Kirim klaim
        </button>
        <button type="button" onClick={() => setOpen(false)} className={outline}>
          Batal
        </button>
      </div>
    </form>
  );
}

const STAR_LABEL = ["", "Buruk", "Kurang", "Cukup", "Bagus", "Sangat bagus"];

/** "Tulis ulasan" on a paid order; with an existing review it shows it and offers "Ubah". */
export function ReviewForm({ storeKey, orderId, review }: { storeKey: string; orderId: string; review: { rating: number; text: string; hidden: boolean } | null }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [state, action, pending] = useActionState(submitReview.bind(null, storeKey), undefined);
  if (!open) {
    if (!review) {
      return (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:underline">
          <Star className="size-4" /> Tulis ulasan
        </button>
      );
    }
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-neutral-500">Ulasan Anda:</span>
        <Stars value={review.rating} />
        {review.hidden && <span className="text-xs text-neutral-400">(disembunyikan penjual)</span>}
        <button type="button" onClick={() => setOpen(true)} className="font-semibold text-neutral-700 hover:underline">
          Ubah
        </button>
      </div>
    );
  }
  return (
    <form action={action} className="grid w-full gap-2">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} bintang`}
            onClick={() => setRating(n)}
            className="rounded p-0.5"
          >
            <Star className={cn("size-7", n <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-500">{STAR_LABEL[rating]}</span>
      </div>
      <textarea name="text" rows={3} maxLength={1000} defaultValue={review?.text} placeholder="Ceritakan pengalaman Anda (opsional)" className={textarea} />
      {state?.ok ? (
        <p className="rounded-[var(--r-inner)] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Terima kasih! Ulasan Anda tersimpan.</p>
      ) : (
        <Feedback state={state} ok="" />
      )}
      <div className="flex flex-wrap gap-2">
        <button disabled={pending || !rating} className={primary}>
          {pending && <Loader2 className="size-4 animate-spin" />} Kirim ulasan
        </button>
        <button type="button" onClick={() => setOpen(false)} className={outline}>
          {state?.ok ? "Tutup" : "Batal"}
        </button>
      </div>
    </form>
  );
}

export function PasswordReset({ email }: { email: string }) {
  const [state, setState] = useState<{ sent?: boolean; error?: string; busy?: boolean }>({});
  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={state.busy || state.sent}
        className={cn(outline, "w-fit")}
        onClick={async () => {
          setState({ busy: true });
          await sendPasswordResetEmail(auth, email).then(
            () => setState({ sent: true }),
            (err) => setState({ error: authError(err) })
          );
        }}
      >
        {state.busy && <Loader2 className="size-4 animate-spin" />} Kirim link ganti password
      </button>
      {state.sent && <p className="text-sm text-emerald-700">Link terkirim ke {email}.</p>}
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
    </div>
  );
}

/** Password accounts: re-enter the password, then Firebase emails a confirmation link to the new address. */
export function ChangeEmailForm({ email }: { email: string }) {
  const [state, setState] = useState<{ sent?: string; error?: string; busy?: boolean }>({});
  if (state.sent) {
    return (
      <p className="rounded-[var(--r-inner)] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        Link konfirmasi dikirim ke <b>{state.sent}</b>. Email baru aktif setelah link diklik; setelah itu masuk lagi dengan email baru.
      </p>
    );
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const newEmail = String(f.get("new_email")).trim();
        setState({ busy: true });
        try {
          const cred = await signInWithEmailAndPassword(auth, email, String(f.get("password")));
          await verifyBeforeUpdateEmail(cred.user, newEmail);
          setState({ sent: newEmail });
        } catch (err) {
          setState({ error: authError(err) });
        }
      }}
    >
      <input name="new_email" type="email" required placeholder="Email baru" autoComplete="email" className={inputCls} />
      <input name="password" type="password" required placeholder="Password saat ini" autoComplete="current-password" className={inputCls} />
      {state.error && <p className="rounded-[var(--r-inner)] bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={state.busy} className={cn(outline, "w-fit")}>
        {state.busy && <Loader2 className="size-4 animate-spin" />} Ganti email
      </button>
    </form>
  );
}

export function DeletionRequestForm({ storeKey, rejectedReason }: { storeKey: string; rejectedReason?: string | null }) {
  const [state, action, pending] = useActionState(requestAccountDeletion.bind(null, storeKey), undefined);
  return (
    <form action={action} className="grid gap-3">
      {rejectedReason && (
        <p className="rounded-[var(--r-inner)] bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Pengajuan sebelumnya ditolak: {rejectedReason}. Anda bisa mengajukan lagi.
        </p>
      )}
      <textarea name="reason" rows={2} maxLength={500} placeholder="Alasan (opsional)" className={textarea} />
      <input name="confirm" required placeholder='Ketik "HAPUS"' autoComplete="off" className={inputCls} />
      <Feedback state={state} ok="Pengajuan terkirim." />
      <button disabled={pending} className={cn(btnDanger, "w-fit")}>
        {pending && <Loader2 className="size-4 animate-spin" />} Ajukan hapus akun
      </button>
    </form>
  );
}

export function CancelDeletionButton() {
  const [state, action, pending] = useActionState(cancelAccountDeletion, undefined);
  return (
    <form action={action} className="grid gap-3">
      {state?.error && <Feedback state={state} ok="" />}
      <button disabled={pending} className={cn(outline, "w-fit")}>
        {pending && <Loader2 className="size-4 animate-spin" />} Batalkan pengajuan
      </button>
    </form>
  );
}
