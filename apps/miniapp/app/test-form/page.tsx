import { PCBuildForm } from "@/components/admin/pc-builds/pc-build-form";

export default function TestFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f0420] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Тест формы с Floating Labels
        </h1>
        <PCBuildForm />
      </div>
    </div>
  );
}
