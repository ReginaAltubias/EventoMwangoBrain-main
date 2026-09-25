import { Banknote, Coins, Leaf, Sprout, Tractor, Users } from "lucide-react";
import type { EntityConfig } from "@/sigaflo/core/config";
import {
  colheitas, colheitasDe, consumos, consumosDe, dataPt, dividas, dividasDe, financas, financasDe,
  kg, kz, produtorPorId, produtores, terras, terrasDe,
  type Colheita, type Consumo, type Divida, type Financa, type Produtor, type Terra,
} from "@/ida-portal/data";

const nomeProdutor = (id: string) => produtorPorId(id)?.nome ?? "—";

const produtoresEntity: EntityConfig<Produtor> = {
  key: "produtores",
  label: "Produtores",
  singular: "Produtor",
  group: "Cadastro",
  icon: Users,
  rows: () => produtores,
  id: (row) => row.id,
  title: (row) => row.nome,
  subtitle: (row) => `${row.codigo} · ${row.actividade} · ${row.municipio}, ${row.provincia}`,
  status: (row) => row.estado,
  searchText: (row) => `${row.nome} ${row.codigo} ${row.instituicao} ${row.provincia} ${row.municipio} ${row.actividade}`,
  columns: [
    { key: "nome", label: "Produtor", render: (row) => <div><p className="font-semibold">{row.nome}</p><p className="text-xs text-muted-foreground">{row.codigo}</p></div> },
    { key: "inst", label: "Instituição", render: (row) => <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{row.instituicao}</span> },
    { key: "act", label: "Actividade", hideOnMobile: true, render: (row) => row.actividade },
    { key: "local", label: "Localização", hideOnMobile: true, render: (row) => `${row.municipio}, ${row.provincia}` },
    { key: "area", label: "Área", render: (row) => `${terrasDe(row.id).reduce((sum, item) => sum + item.areaHa, 0).toLocaleString("pt-AO")} ha` },
  ],
  filters: [
    { key: "inst", label: "Instituição", options: ["INCA", "IDF", "INCER", "IDA"], match: (row, value) => row.instituicao === value },
    { key: "prov", label: "Província", options: [...new Set(produtores.map((row) => row.provincia))], match: (row, value) => row.provincia === value },
    { key: "est", label: "Estado", options: [...new Set(produtores.map((row) => row.estado))], match: (row, value) => row.estado === value },
  ],
  sections: (row) => {
    const terrasRow = terrasDe(row.id);
    const colheitasRow = colheitasDe(row.id);
    const consumosRow = consumosDe(row.id);
    const financasRow = financasDe(row.id);
    const dividasRow = dividasDe(row.id);
    const dividaAberta = dividasRow.filter((item) => item.estado !== "Liquidada").reduce((sum, item) => sum + (item.valorKz - item.pagoKz), 0);
    return [
      {
        title: "Identificação do produtor",
        fields: [
          { label: "Designação", value: row.nome },
          { label: "Código de registo", value: row.codigo },
          { label: "Instituição responsável", value: row.instituicao },
          { label: "Actividade", value: row.actividade },
          { label: "Tipo", value: row.tipo },
          { label: "Documento", value: row.documento },
          { label: "Telefone", value: row.telefone },
          { label: "E-mail", value: row.email },
          { label: "Acompanhamento", value: row.responsavel },
          { label: "Província", value: row.provincia },
          { label: "Município", value: row.municipio },
          { label: "Comuna", value: row.comuna },
          { label: "Data de registo", value: dataPt(row.dataRegisto) },
          { label: "Estado do cadastro", value: row.estado },
        ],
      },
      {
        title: "Resumo consolidado",
        fields: [
          { label: "Terras registadas", value: `${terrasRow.length} (${terrasRow.reduce((s, i) => s + i.areaHa, 0).toLocaleString("pt-AO")} ha)` },
          { label: "Colheitas", value: `${colheitasRow.length} · ${kg(colheitasRow.reduce((s, i) => s + i.quantidadeKg, 0))}` },
          { label: "Consumo de recursos", value: kz(consumosRow.reduce((s, i) => s + i.custoKz, 0)) },
          { label: "Movimento financeiro", value: kz(financasRow.reduce((s, i) => s + i.valorKz, 0)) },
          { label: "Dívida em aberto", value: kz(dividaAberta) },
          { label: "Dívidas liquidadas", value: `${dividasRow.filter((item) => item.estado === "Liquidada").length} de ${dividasRow.length}` },
        ],
      },
      {
        title: "Terras",
        table: {
          columns: [
            { key: "cod", label: "Código", render: (item: Terra) => item.codigo },
            { key: "des", label: "Designação", render: (item: Terra) => item.designacao },
            { key: "area", label: "Área", render: (item: Terra) => `${item.areaHa.toLocaleString("pt-AO")} ha` },
            { key: "uso", label: "Uso", render: (item: Terra) => item.uso },
            { key: "reg", label: "Regime", render: (item: Terra) => item.regime },
            { key: "est", label: "Estado", render: (item: Terra) => item.estado },
          ],
          rows: terrasRow,
        },
      },
      {
        title: "Colheitas",
        table: {
          columns: [
            { key: "cod", label: "Código", render: (item: Colheita) => item.codigo },
            { key: "cul", label: "Cultura", render: (item: Colheita) => item.cultura },
            { key: "cam", label: "Campanha", render: (item: Colheita) => item.campanha },
            { key: "dat", label: "Data", render: (item: Colheita) => dataPt(item.data) },
            { key: "qtd", label: "Quantidade", render: (item: Colheita) => kg(item.quantidadeKg) },
            { key: "qua", label: "Qualidade", render: (item: Colheita) => item.qualidade },
            { key: "des", label: "Destino", render: (item: Colheita) => item.destino },
            { key: "est", label: "Estado", render: (item: Colheita) => item.estado },
          ],
          rows: colheitasRow,
        },
      },
      {
        title: "Consumo de recursos",
        table: {
          columns: [
            { key: "cod", label: "Código", render: (item: Consumo) => item.codigo },
            { key: "rec", label: "Recurso", render: (item: Consumo) => item.recurso },
            { key: "qtd", label: "Quantidade", render: (item: Consumo) => `${item.quantidade.toLocaleString("pt-AO")} ${item.unidade}` },
            { key: "per", label: "Período", render: (item: Consumo) => item.periodo },
            { key: "cus", label: "Custo", render: (item: Consumo) => kz(item.custoKz) },
            { key: "est", label: "Estado", render: (item: Consumo) => item.estado },
          ],
          rows: consumosRow,
        },
      },
      {
        title: "Finanças",
        table: {
          columns: [
            { key: "cod", label: "Código", render: (item: Financa) => item.codigo },
            { key: "tip", label: "Tipo", render: (item: Financa) => item.tipo },
            { key: "dat", label: "Data", render: (item: Financa) => dataPt(item.data) },
            { key: "val", label: "Valor", render: (item: Financa) => kz(item.valorKz) },
            { key: "est", label: "Estado", render: (item: Financa) => item.estado },
          ],
          rows: financasRow,
        },
      },
      {
        title: "Dívidas",
        table: {
          columns: [
            { key: "cod", label: "Código", render: (item: Divida) => item.codigo },
            { key: "ori", label: "Origem", render: (item: Divida) => item.origem },
            { key: "val", label: "Valor", render: (item: Divida) => kz(item.valorKz) },
            { key: "pag", label: "Já pago", render: (item: Divida) => kz(item.pagoKz) },
            { key: "sal", label: "Saldo", render: (item: Divida) => kz(item.valorKz - item.pagoKz) },
            { key: "ven", label: "Vencimento", render: (item: Divida) => dataPt(item.vencimento) },
            { key: "est", label: "Estado", render: (item: Divida) => item.estado },
          ],
          rows: dividasRow,
        },
      },
    ];
  },
};

const terrasEntity: EntityConfig<Terra> = {
  key: "terras",
  label: "Terras",
  singular: "Terra",
  group: "Produção",
  icon: Sprout,
  rows: () => terras,
  id: (row) => row.id,
  title: (row) => row.designacao,
  subtitle: (row) => `${row.codigo} · ${nomeProdutor(row.produtorId)}`,
  status: (row) => row.estado,
  searchText: (row) => `${row.codigo} ${row.designacao} ${row.uso} ${row.provincia} ${nomeProdutor(row.produtorId)}`,
  columns: [
    { key: "cod", label: "Código", render: (row) => row.codigo },
    { key: "prod", label: "Produtor", render: (row) => nomeProdutor(row.produtorId) },
    { key: "des", label: "Designação", hideOnMobile: true, render: (row) => row.designacao },
    { key: "area", label: "Área", render: (row) => `${row.areaHa.toLocaleString("pt-AO")} ha` },
    { key: "uso", label: "Uso", hideOnMobile: true, render: (row) => row.uso },
  ],
  filters: [
    { key: "prov", label: "Província", options: [...new Set(terras.map((row) => row.provincia))], match: (row, value) => row.provincia === value },
    { key: "reg", label: "Regime", options: [...new Set(terras.map((row) => row.regime))], match: (row, value) => row.regime === value },
  ],
  sections: (row) => [
    {
      title: "Dados da terra",
      fields: [
        { label: "Código", value: row.codigo },
        { label: "Designação", value: row.designacao },
        { label: "Produtor", value: nomeProdutor(row.produtorId) },
        { label: "Área", value: `${row.areaHa.toLocaleString("pt-AO")} ha` },
        { label: "Uso principal", value: row.uso },
        { label: "Regime de posse", value: row.regime },
        { label: "Província", value: row.provincia },
        { label: "Município", value: row.municipio },
        { label: "Estado", value: row.estado },
      ],
    },
    {
      title: "Colheitas nesta terra",
      table: {
        columns: [
          { key: "cod", label: "Código", render: (item: Colheita) => item.codigo },
          { key: "cul", label: "Cultura", render: (item: Colheita) => item.cultura },
          { key: "dat", label: "Data", render: (item: Colheita) => dataPt(item.data) },
          { key: "qtd", label: "Quantidade", render: (item: Colheita) => kg(item.quantidadeKg) },
          { key: "est", label: "Estado", render: (item: Colheita) => item.estado },
        ],
        rows: colheitas.filter((item) => item.terraId === row.id),
      },
    },
  ],
};

const colheitasEntity: EntityConfig<Colheita> = {
  key: "colheitas",
  label: "Colheitas",
  singular: "Colheita",
  group: "Produção",
  icon: Leaf,
  rows: () => colheitas,
  id: (row) => row.id,
  title: (row) => `${row.cultura} · ${row.codigo}`,
  subtitle: (row) => `${nomeProdutor(row.produtorId)} · campanha ${row.campanha}`,
  status: (row) => row.estado,
  searchText: (row) => `${row.codigo} ${row.cultura} ${row.campanha} ${row.destino} ${nomeProdutor(row.produtorId)}`,
  columns: [
    { key: "cod", label: "Código", render: (row) => row.codigo },
    { key: "prod", label: "Produtor", render: (row) => nomeProdutor(row.produtorId) },
    { key: "cul", label: "Cultura", render: (row) => row.cultura },
    { key: "qtd", label: "Quantidade", render: (row) => kg(row.quantidadeKg) },
    { key: "dat", label: "Data", hideOnMobile: true, render: (row) => dataPt(row.data) },
  ],
  filters: [
    { key: "cul", label: "Cultura", options: [...new Set(colheitas.map((row) => row.cultura))], match: (row, value) => row.cultura === value },
    { key: "cam", label: "Campanha", options: [...new Set(colheitas.map((row) => row.campanha))], match: (row, value) => row.campanha === value },
  ],
  sections: (row) => [
    {
      title: "Dados da colheita",
      fields: [
        { label: "Código", value: row.codigo },
        { label: "Produtor", value: nomeProdutor(row.produtorId) },
        { label: "Cultura", value: row.cultura },
        { label: "Campanha", value: row.campanha },
        { label: "Data", value: dataPt(row.data) },
        { label: "Quantidade", value: kg(row.quantidadeKg) },
        { label: "Qualidade", value: row.qualidade },
        { label: "Destino", value: row.destino },
        { label: "Estado", value: row.estado },
      ],
    },
  ],
};

const consumosEntity: EntityConfig<Consumo> = {
  key: "consumos",
  label: "Consumo de recursos",
  singular: "Consumo",
  group: "Recursos",
  icon: Tractor,
  rows: () => consumos,
  id: (row) => row.id,
  title: (row) => `${row.recurso} · ${row.codigo}`,
  subtitle: (row) => `${nomeProdutor(row.produtorId)} · ${row.periodo}`,
  status: (row) => row.estado,
  searchText: (row) => `${row.codigo} ${row.recurso} ${row.periodo} ${nomeProdutor(row.produtorId)}`,
  columns: [
    { key: "cod", label: "Código", render: (row) => row.codigo },
    { key: "prod", label: "Produtor", render: (row) => nomeProdutor(row.produtorId) },
    { key: "rec", label: "Recurso", render: (row) => row.recurso },
    { key: "qtd", label: "Quantidade", render: (row) => `${row.quantidade.toLocaleString("pt-AO")} ${row.unidade}` },
    { key: "cus", label: "Custo", hideOnMobile: true, render: (row) => kz(row.custoKz) },
  ],
  filters: [{ key: "rec", label: "Recurso", options: [...new Set(consumos.map((row) => row.recurso))], match: (row, value) => row.recurso === value }],
  sections: (row) => [
    {
      title: "Dados do consumo",
      fields: [
        { label: "Código", value: row.codigo },
        { label: "Produtor", value: nomeProdutor(row.produtorId) },
        { label: "Recurso", value: row.recurso },
        { label: "Quantidade", value: `${row.quantidade.toLocaleString("pt-AO")} ${row.unidade}` },
        { label: "Período", value: row.periodo },
        { label: "Custo", value: kz(row.custoKz) },
        { label: "Estado", value: row.estado },
      ],
    },
  ],
};

const financasEntity: EntityConfig<Financa> = {
  key: "financas",
  label: "Finanças",
  singular: "Movimento financeiro",
  group: "Finanças",
  icon: Banknote,
  rows: () => financas,
  id: (row) => row.id,
  title: (row) => `${row.tipo} · ${row.codigo}`,
  subtitle: (row) => nomeProdutor(row.produtorId),
  status: (row) => row.estado,
  searchText: (row) => `${row.codigo} ${row.tipo} ${row.descricao} ${nomeProdutor(row.produtorId)}`,
  columns: [
    { key: "cod", label: "Código", render: (row) => row.codigo },
    { key: "prod", label: "Produtor", render: (row) => nomeProdutor(row.produtorId) },
    { key: "tip", label: "Tipo", render: (row) => row.tipo },
    { key: "val", label: "Valor", render: (row) => kz(row.valorKz) },
    { key: "dat", label: "Data", hideOnMobile: true, render: (row) => dataPt(row.data) },
  ],
  filters: [{ key: "tip", label: "Tipo", options: [...new Set(financas.map((row) => row.tipo))], match: (row, value) => row.tipo === value }],
  sections: (row) => [
    {
      title: "Movimento financeiro",
      fields: [
        { label: "Código", value: row.codigo },
        { label: "Produtor", value: nomeProdutor(row.produtorId) },
        { label: "Tipo", value: row.tipo },
        { label: "Descrição", value: row.descricao, full: true },
        { label: "Valor", value: kz(row.valorKz) },
        { label: "Data", value: dataPt(row.data) },
        { label: "Estado", value: row.estado },
      ],
    },
  ],
};

const dividasEntity: EntityConfig<Divida> = {
  key: "dividas",
  label: "Dívidas",
  singular: "Dívida",
  group: "Finanças",
  icon: Coins,
  rows: () => dividas,
  id: (row) => row.id,
  title: (row) => `${row.origem} · ${row.codigo}`,
  subtitle: (row) => `${nomeProdutor(row.produtorId)} · vence a ${dataPt(row.vencimento)}`,
  status: (row) => row.estado,
  searchText: (row) => `${row.codigo} ${row.origem} ${row.estado} ${nomeProdutor(row.produtorId)}`,
  columns: [
    { key: "cod", label: "Código", render: (row) => row.codigo },
    { key: "prod", label: "Produtor", render: (row) => nomeProdutor(row.produtorId) },
    { key: "ori", label: "Origem", hideOnMobile: true, render: (row) => row.origem },
    { key: "val", label: "Valor", render: (row) => kz(row.valorKz) },
    { key: "sal", label: "Saldo", render: (row) => kz(row.valorKz - row.pagoKz) },
  ],
  filters: [{ key: "est", label: "Estado", options: [...new Set(dividas.map((row) => row.estado))], match: (row, value) => row.estado === value }],
  sections: (row) => [
    {
      title: "Dados da dívida",
      fields: [
        { label: "Código", value: row.codigo },
        { label: "Produtor", value: nomeProdutor(row.produtorId) },
        { label: "Origem", value: row.origem },
        { label: "Valor total", value: kz(row.valorKz) },
        { label: "Já pago", value: kz(row.pagoKz) },
        { label: "Saldo em aberto", value: kz(row.valorKz - row.pagoKz) },
        { label: "Vencimento", value: dataPt(row.vencimento) },
        { label: "Estado", value: row.estado },
      ],
    },
  ],
};

export const idaEntities: EntityConfig<any>[] = [produtoresEntity, terrasEntity, colheitasEntity, consumosEntity, financasEntity, dividasEntity];

export const entidadeIda = (key?: string) => idaEntities.find((item) => item.key === key);
