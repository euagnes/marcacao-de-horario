"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatarCpf, cpfValido, soDigitos } from "@/lib/cpf";

/** Lê um arquivo de imagem e devolve um data URL JPEG redimensionado (máx. 400px). */
function redimensionarImagem(file: File, max = 400, qualidade = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CadastroPage() {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", telefone: "", senha: "" });
  const [foto, setFoto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Selecione um arquivo de imagem."); return; }
    try {
      const dataUrl = await redimensionarImagem(file);
      setFoto(dataUrl);
      setErro(null);
    } catch {
      setErro("Não foi possível processar a imagem.");
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!cpfValido(form.cpf)) { setErro("CPF inválido."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cpf: soDigitos(form.cpf), fotoUrl: foto }),
      });
      const json = await res.json();
      if (!res.ok) { setErro(json.erro ?? "Erro ao cadastrar."); return; }
      setOk(true);
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        {ok ? (
          <div className="card text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mar-100 text-3xl">📨</div>
            <h1 className="mt-4 text-2xl font-bold text-mar-800">Cadastro enviado!</h1>
            <p className="mt-2 text-mar-600">
              Seu cadastro está <strong>aguardando aprovação</strong> do administrador.
              Assim que for aprovado, você receberá um <strong>e-mail</strong> e poderá entrar para agendar.
            </p>
            <Link href="/" className="btn-primary mt-6">Voltar ao início</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-mar-800">Criar conta</h1>
            <p className="mt-1 text-mar-500">Cadastre-se para poder agendar. O acesso é liberado após aprovação.</p>
            <form onSubmit={enviar} className="card mt-6 space-y-4">
              {/* Foto */}
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-mar-100 text-2xl text-mar-400 ring-2 ring-mar-100">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="Prévia" className="h-full w-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost !py-2 text-sm">
                    {foto ? "Trocar foto" : "📷 Adicionar foto"}
                  </button>
                  {foto && (
                    <button type="button" onClick={() => setFoto(null)} className="ml-2 text-sm text-coral-500 hover:underline">
                      Remover
                    </button>
                  )}
                  <p className="mt-1 text-xs text-mar-400">Opcional. A imagem é reduzida automaticamente.</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={escolherFoto} />
              </div>

              <div>
                <label className="label">Nome completo *</label>
                <input className="input" required value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" />
              </div>
              <div>
                <label className="label">CPF *</label>
                <input className="input" required inputMode="numeric" value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: formatarCpf(e.target.value) })}
                  placeholder="000.000.000-00" maxLength={14} />
              </div>
              <div>
                <label className="label">E-mail *</label>
                <input type="email" className="input" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" />
              </div>
              <div>
                <label className="label">Telefone / WhatsApp *</label>
                <input className="input" required value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(32) 90000-0000" />
              </div>
              <div>
                <label className="label">Senha * (mín. 6 caracteres)</label>
                <input type="password" className="input" required minLength={6} value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })} />
              </div>
              {erro && <p className="rounded-lg bg-coral-500/10 px-4 py-2 text-sm text-coral-500">{erro}</p>}
              <button disabled={enviando} className="btn-primary w-full">
                {enviando ? "Enviando…" : "Criar conta"}
              </button>
              <p className="text-center text-sm text-mar-500">
                Já tem conta? <Link href="/login" className="text-mar-600 hover:underline">Entrar</Link>
              </p>
            </form>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
