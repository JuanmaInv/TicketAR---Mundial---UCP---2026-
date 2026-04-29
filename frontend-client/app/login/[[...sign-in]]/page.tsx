import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-2 rounded-[2.5rem] bg-white dark:bg-slate-900/80 relative overflow-hidden shadow-xl">
        <SignIn 
            path="/login"
            fallbackRedirectUrl="/profile"
            signUpUrl="/register"
            appearance={{
                elements: {
                    formButtonPrimary: "bg-[var(--usa-blue)] hover:bg-blue-800 text-sm font-black uppercase tracking-widest",
                    card: "bg-transparent shadow-none border-none",
                }
            }}
        />
      </div>
    </div>
  );
}
