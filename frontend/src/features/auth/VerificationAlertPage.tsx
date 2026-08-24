import { MailCheck } from "lucide-react";

interface VerificationPro

const VerificatioAlertPage = ({formData})=>{
   return(
    <div className="w-[380px] md:w-[420px] max-w-lg mx-auto bg-[#0a0a0a] p-8 flex flex-col items-center text-center gap-6 shadow-2xl rounded-3xl border border-white/10 my-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-1">
            <MailCheck size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-sm text-gray-400">
              We've sent a verification link to <span className="text-white font-medium">{formData.email}</span>. Please check your inbox to activate your account.
            </p>
          </div>

          <div className="w-full pt-4 border-t border-white/10">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 rounded-xl transition-colors text-sm"
            >
              Proceed to Sign In
            </button>
          </div>
        </div>
   )
}

export default VerificatioAlertPage;