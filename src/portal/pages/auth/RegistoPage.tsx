import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProgress } from "@/portal/components/StepProgress";
import { FileUpload } from "@/portal/components/FileUpload";

import { usePortalAuth } from "@/portal/auth/PortalAuthContext";

import { PROVINCIAS, municipiosDaProvincia } from "@/lib/angolaApi";
import { toast } from "sonner";
import type { OperadorConta } from "@/portal/data/mock";

const passos = ["Identificação", "Dados legais", "Morada", "Contactos", "Documentos", "Revisão"];

type TipoEntidade = "Empresa" | "Cooperativa" | "Associação" | "Pessoa singular";
const tiposEntidade: TipoEntidade[] = ["Empresa", "Cooperativa", "Associação", "Pessoa singular"];
const pedeBI = (t: TipoEntidade | "") => t === "Pessoa singular";

interface Contacto { nome: string; email: string; telefone: string; principal: boolean }

export default function RegistoPage() {
  const [passo, setPasso] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { registar } = usePortalAuth();
  const intentRetido = (location.state as { intent?: unknown } | null)?.intent;

  // —— Identificação ——
  const [tipoEntidade, setTipoEntidade] = useState<TipoEntidade | "">("");
  const [documento, setDocumento] = useState("");


  const [dados, setDados] = useState({
    tipoSujeito: "", denominacao: "", nif: "", bi: "", dataConstituicao: "", objectoSocial: "",
    sede: "", provincia: "", provincias: [] as string[], municipio: "", comuna: "", bairro: "",
    password: "",
  });

  const [contactos, setContactos] = useState<Contacto[]>([{ nome: "", email: "", telefone: "", principal: true }]);
  const [docsCarregados, setDocsCarregados] = useState<Record<string, File | null>>({});
  const [validadeTributaria, setValidadeTributaria] = useState("");
  const [capacidadeFinanceira, setCapacidadeFinanceira] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  // —— Divisões administrativas (dados locais) ——
  const provincias = PROVINCIAS;
  const municipios = municipiosDaProvincia(dados.provincia);


  const set = (k: keyof typeof dados, v: string) => setDados((d) => ({ ...d, [k]: v }));
  const toggleProvincia = (p: string) =>
    setDados((d) => ({ ...d, provincias: d.provincias.includes(p) ? d.provincias.filter((x) => x !== p) : [...d.provincias, p] }));




  const docsObrigatorios = [
    { id: "pacto", label: "Pacto social" },
    { id: "registo-fiscal", label: "Comprovativo de registo fiscal" },
    { id: "sujeicao", label: "Declaração de sujeição às leis e tribunais nacionais" },
    { id: "bancaria", label: "Declaração bancária de capacidade financeira" },
    { id: "tributaria", label: "Certidão de conformidade tributária" },
    { id: "croquis", label: "Croquis de localização (escala 1/100.000)" },
    { id: "memoria", label: "Memória descritiva" },
    { id: "especies", label: "Relatório de espécies e produtos" },
    { id: "viabilidade", label: "Estudo de viabilidade técnico-económica e financeira" },
  ];

  const submeter = () => {
    const conta: OperadorConta = {
      nif: dados.nif || dados.bi,
      email: contactos.find((c) => c.principal)?.email || contactos[0].email,
      password: dados.password || "idf2026",
      denominacao: dados.denominacao,
      nrof: null,
      estado: "EmAnalise",
      categorias: [],
      provincias: dados.provincias,
      municipio: dados.municipio,
      sede: dados.sede,
      tipoSujeito: dados.tipoSujeito,
      dataConstituicao: dados.dataConstituicao,
      objectoSocial: dados.objectoSocial,
    };
    registar(conta);
    toast.success("Registo submetido com sucesso.");
    navigate("/estado-registo", { state: { intent: intentRetido } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">Registo de Operador Florestal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha os dados do requerente em seis passos simples.
        </p>
      </div>

      <div className="mt-8">
        <StepProgress passos={passos} actual={passo} onSelect={(i) => i < passo && setPasso(i)} />
      </div>

      <div className="card-elevated mt-6 rounded-xl p-6 animate-fade-in" key={passo}>
        {passo === 0 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>Tipo de requerente *</Label>
              <Select
                value={tipoEntidade}
                onValueChange={(v) => {
                  const t = v as TipoEntidade;
                  setTipoEntidade(t);
                  setDocumento("");
                  setDados((d) => ({
                    ...d,
                    nif: "",
                    bi: "",
                    tipoSujeito: t === "Pessoa singular" ? "Pessoa singular (apenas Apícola/PFNL)" : t === "Empresa" ? "Pessoa colectiva de direito angolano" : t,
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                <SelectContent>{tiposEntidade.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {tipoEntidade && (
              <div className="space-y-1.5">
                <Label>{pedeBI(tipoEntidade) ? "Número do Bilhete de Identidade *" : "NIF *"}</Label>
                <Input
                  value={documento}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDocumento(v);
                    setDados((d) => (pedeBI(tipoEntidade) ? { ...d, bi: v, nif: "" } : { ...d, nif: v, bi: "" }));
                  }}
                  placeholder={pedeBI(tipoEntidade) ? "000000000LA000" : "5XXXXXXXXX"}
                />
                <p className="text-xs text-muted-foreground">
                  {pedeBI(tipoEntidade)
                    ? "Indique o número do Bilhete de Identidade do requerente."
                    : "Indique o NIF da entidade requerente."}
                </p>
              </div>
            )}
          </div>
        )}


        {passo === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tipo de sujeito</Label>
              <Input value={dados.tipoSujeito} readOnly disabled />
              {pedeBI(tipoEntidade) && (
                <p className="text-xs text-warning">Pessoa singular apenas para as categorias Apícola ou PFNL.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{pedeBI(tipoEntidade) ? "Nome completo" : "Denominação social"}</Label>
              <Input value={dados.denominacao} onChange={(e) => set("denominacao", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{pedeBI(tipoEntidade) ? "Bilhete de Identidade" : "NIF"}</Label>
              <Input value={dados.bi || dados.nif} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label>{pedeBI(tipoEntidade) ? "Data de nascimento" : "Data de constituição"}</Label>
              <Input type="date" value={dados.dataConstituicao} onChange={(e) => set("dataConstituicao", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Palavra-passe de acesso *</Label>
              <Input type="password" value={dados.password} onChange={(e) => set("password", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{pedeBI(tipoEntidade) ? "Actividade a exercer *" : "Objecto social *"}</Label>
              <textarea
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dados.objectoSocial}
                onChange={(e) => set("objectoSocial", e.target.value)}
              />
            </div>
          </div>
        )}

        {passo === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Província *</Label>
              <Select value={dados.provincia} onValueChange={(v) => setDados((d) => ({ ...d, provincia: v, municipio: "", comuna: "" }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar província" /></SelectTrigger>
                <SelectContent>
                  {provincias.map((p) => <SelectItem key={p.slug} value={p.nome}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Município *</Label>
              <Select value={dados.municipio} onValueChange={(v) => setDados((d) => ({ ...d, municipio: v, comuna: "" }))} disabled={!dados.provincia}>
                <SelectTrigger><SelectValue placeholder={dados.provincia ? "Seleccionar município" : "Escolha primeiro a província"} /></SelectTrigger>
                <SelectContent>
                  {municipios.map((m) => <SelectItem key={m.slug} value={m.nome}>{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Comuna</Label>
              <Input value={dados.comuna} onChange={(e) => set("comuna", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Bairro</Label>
              <Input value={dados.bairro} onChange={(e) => set("bairro", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Rua / morada *</Label>
              <Input value={dados.sede} onChange={(e) => set("sede", e.target.value)} placeholder="Rua, número" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Província(s) de operação *</Label>
              <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-input p-2">
                {provincias.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => toggleProvincia(p.nome)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      dados.provincias.includes(p.nome) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="space-y-4">
            {contactos.map((c, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={c.nome} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input type="email" value={c.email} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input value={c.telefone} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, telefone: e.target.value } : x)))} />
                </div>
                <div className="flex items-center gap-3 sm:col-span-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={c.principal}
                      onCheckedChange={() => setContactos((cs) => cs.map((x, j) => ({ ...x, principal: j === i })))}
                    />
                    Contacto principal
                  </label>
                  {contactos.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setContactos((cs) => cs.filter((_, j) => j !== i))}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setContactos((cs) => [...cs, { nome: "", email: "", telefone: "", principal: false }])}>
              <Plus className="mr-1.5 h-4 w-4" /> Adicionar contacto
            </Button>
          </div>
        )}

        {passo === 4 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {docsObrigatorios.map((d) => (
              <FileUpload key={d.id} label={d.label} obrigatorio value={docsCarregados[d.id]} onChange={(f) => setDocsCarregados((x) => ({ ...x, [d.id]: f }))} />
            ))}
          </div>
        )}

        {passo === 5 && (
          <div className="space-y-5">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Tipo de requerente", tipoEntidade],
                ["Tipo de sujeito", dados.tipoSujeito],
                [pedeBI(tipoEntidade) ? "Nome" : "Denominação", dados.denominacao],
                [pedeBI(tipoEntidade) ? "BI" : "NIF", dados.bi || dados.nif],
                [pedeBI(tipoEntidade) ? "Nascimento" : "Constituição", dados.dataConstituicao],
                ["Morada", [dados.sede, dados.bairro, dados.comuna, dados.municipio, dados.provincia].filter(Boolean).join(", ")],
                ["Províncias de operação", dados.provincias.join(", ")],
                ["Contactos", `${contactos.length} contacto(s), principal: ${contactos.find((c) => c.principal)?.email || "—"}`],
                ["Documentos", `${Object.values(docsCarregados).filter(Boolean).length} de ${docsObrigatorios.length} carregados`],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Checkbox checked={confirmado} onCheckedChange={(v) => setConfirmado(v === true)} className="mt-0.5" />
              Confirmo que os dados e documentos apresentados são verdadeiros e aceito sujeitar-me às leis e tribunais nacionais.
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Anterior
        </Button>
        {passo < 5 ? (
          <Button onClick={() => setPasso((p) => p + 1)} disabled={passo === 0 && (!tipoEntidade || !documento.trim())}>
            Seguinte <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submeter} disabled={!confirmado} className="bg-accent text-accent-foreground hover:bg-accent-light">
            <Send className="mr-1.5 h-4 w-4" /> Submeter registo
          </Button>
        )}
      </div>
    </div>
  );
}
