import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monynha Me</h1>
          <p className="text-gray-600">Crie sua conta</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Após o registro, sua conta será analisada pela equipe Monynha antes da aprovação.</p>
        </div>
      </div>
    </div>
  )
}
