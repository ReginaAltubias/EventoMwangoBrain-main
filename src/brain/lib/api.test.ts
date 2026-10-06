import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./api";
import { brainService } from "../services";

describe("API client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses a JSON response and sends JSON headers", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(api.post<{ ok: boolean }>("/api/state", { query: "demo" })).resolves.toEqual({
      ok: true,
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/state");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Accept")).toBe("application/json");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
  });

  it("preserves server error messages and status codes", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "Acesso negado." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(api.get("/api/state")).rejects.toMatchObject({
      name: "ApiError",
      message: "Acesso negado.",
      status: 403,
    });
  });

  it("accepts an explicit no-content response", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(api.delete("/api/contacts/contact-1")).resolves.toBeUndefined();
  });

  it("accepts an empty HTTP 200 response for delete operations", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await expect(api.delete("/api/contacts/contact-1")).resolves.toBeUndefined();
  });

  it("reports an empty successful response when the contract expects a body", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await expect(api.get("/api/state")).rejects.toBeInstanceOf(ApiError);
  });

  it("reports a malformed JSON response instead of hiding the API failure", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("{invalid", { status: 200 }));

    await expect(api.get("/api/state")).rejects.toMatchObject({
      name: "ApiError",
      status: 200,
    });
  });

  it("saves the evaluation using the POST method documented by the remote API", async () => {
    const evaluation = {
      scores: { Organização: 4, "Visibilidade da marca": 5 },
      wentWell: "As demonstrações geraram conversas de qualidade.",
      difficulties: "Picos de afluência.",
      topSolutions: ["RIVO", "SIGAFLO"],
      mainNeeds: "Integração de dados.",
      improvements: "Reforçar a equipa.",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(evaluation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.saveEvaluation(evaluation);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/evaluation");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(evaluation);
  });

  it("loads the internal evaluation through GET and validates its response", async () => {
    const evaluation = {
      scores: { Organização: 4, "Visibilidade da marca": 5 },
      wentWell: "As demonstrações geraram conversas de qualidade.",
      difficulties: "Picos de afluência.",
      topSolutions: ["RIVO", "SIGAFLO"],
      mainNeeds: "Integração de dados.",
      improvements: "Reforçar a equipa.",
      savedAt: "2026-10-06T11:48:33.000000Z",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(evaluation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getEvaluation()).resolves.toEqual(evaluation);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/evaluation");
    expect(init?.method).toBeUndefined();
  });

  it("rejects evaluation responses that do not match the remote contract", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({
        scores: { Organização: 6 },
        wentWell: "",
        difficulties: "",
        topSolutions: [],
        mainNeeds: "",
        improvements: "",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getEvaluation()).rejects.toThrow("formato inválido");
  });

  it("does not submit evaluation scores outside the documented 1-to-5 range", async () => {
    await expect(brainService.saveEvaluation({
      scores: { Organização: 6 },
      wentWell: "",
      difficulties: "",
      topSolutions: [],
      mainNeeds: "",
      improvements: "",
    })).rejects.toThrow("formato inválido");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("includes the required ownerId when creating a meeting", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "meeting-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createMeeting(
      {
        leadId: "lead-1",
        type: "Demonstração",
        start: "2026-10-07T10:00:00.000Z",
        end: "2026-10-07T11:00:00.000Z",
        location: "Online",
      },
      "USR-01",
    );

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/meetings");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toMatchObject({ leadId: "lead-1", ownerId: "USR-01" });
  });

  it("lists meetings through the dedicated remote endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "MTG-1",
            leadId: "LEAD-1",
            type: "Demonstração",
            start: "2026-10-07T10:00:00Z",
            end: "2026-10-07T11:00:00Z",
            ownerId: "USR-01",
            location: "Sala B",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(brainService.getMeetings()).resolves.toMatchObject([
      { id: "MTG-1", leadId: "LEAD-1", type: "Demonstração" },
    ]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/meetings");
    expect(init?.method).toBeUndefined();
  });

  it("lists visitor feedback through the dedicated endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: "FDB-1", overall: 4, team: 5, presentation: 4, relevance: 5 }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getFeedback()).resolves.toMatchObject([{ id: "FDB-1", overall: 4 }]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/feedback");
    expect(init?.method).toBeUndefined();
  });

  it("submits feedback with the four required ratings", async () => {
    const data = {
      overall: 5 as const,
      team: 4,
      presentation: 5,
      relevance: 4,
      highlights: [],
      wantsContact: false,
      comment: "Boa demonstração",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "FDB-2", ...data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createFeedback(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/feedback");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("lists solutions through the dedicated endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: "SOL-1", name: "RIVO", subtitle: "Gestão integrada" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getSolutions()).resolves.toMatchObject([{ id: "SOL-1", name: "RIVO" }]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/solutions");
    expect(init?.method).toBeUndefined();
  });

  it("creates a solution with its required name and subtitle", async () => {
    const data = { name: "Produto novo", subtitle: "Descrição da solução" };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "SOL-7", ...data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createSolution(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/solutions");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("lists users through the dedicated endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: 12, name: "Equipa Mwango", email: "team@example.com" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getUsers()).resolves.toEqual([
      { id: 12, name: "Equipa Mwango", email: "team@example.com" },
    ]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/users");
    expect(init?.method).toBeUndefined();
  });

  it("deletes a user through the encoded user ID endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(brainService.deleteUser(12)).resolves.toBeUndefined();

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/users/12");
    expect(init?.method).toBe("DELETE");
  });

  it("lists notifications through the dedicated endpoint", async () => {
    const notifications = [{
      id: "N-1",
      title: "Nova lead",
      detail: "Foi criada uma lead.",
      date: "2026-10-06",
      read: false,
      href: "/leads",
    }];
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(notifications), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getNotifications()).resolves.toEqual(notifications);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/notifications");
    expect(init?.method).toBeUndefined();
  });

  it("marks a notification as read through PATCH", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.markNotificationRead("N-1")).resolves.toEqual({ ok: true });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/notifications/N-1/read");
    expect(init?.method).toBe("PATCH");
  });

  it("updates a solution through PATCH", async () => {
    const data = { name: "RIVO", subtitle: "Nova descrição" };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "SOL-1", ...data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.updateSolution("SOL-1", data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/solutions/SOL-1");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("deletes a solution through its ID endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Solução removida" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.deleteSolution("SOL-1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/solutions/SOL-1");
    expect(init?.method).toBe("DELETE");
  });

  it("lists contacts through the contacts collection endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: "CON-1", fullName: "Ana" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getContacts()).resolves.toMatchObject([{ id: "CON-1" }]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/contacts");
    expect(init?.method).toBeUndefined();
  });

  it("loads one contact from its detail endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "CON-1", fullName: "Ana" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getContact("CON-1")).resolves.toMatchObject({ id: "CON-1" });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/contacts/CON-1");
    expect(init?.method).toBeUndefined();
  });

  it("creates a standalone contact with the documented required source field", async () => {
    const data = {
      fullName: "Ana",
      company: "Mwango",
      phone: "923000000",
      source: "Stand" as const,
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "CON-1" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createContact(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/contacts");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("updates a contact using PUT and the editable contact fields", async () => {
    const data = {
      fullName: "Ana",
      company: "Mwango",
      phone: "923000000",
      source: "Stand" as const,
      email: "ana@example.com",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "CON-1", ...data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.updateContact("CON-1", data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/contacts/CON-1");
    expect(init?.method).toBe("PUT");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("deletes a contact through its ID endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Contacto eliminado" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.deleteContact("CON-1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/contacts/CON-1");
    expect(init?.method).toBe("DELETE");
  });

  it("lists leads from the dedicated endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify([{ id: "LEAD-1", contactId: "CON-1" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(brainService.getLeads()).resolves.toMatchObject([{ id: "LEAD-1" }]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads");
    expect(init?.method).toBeUndefined();
  });

  it("gets one lead by its encoded ID", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "LEAD/1", contactId: "CON-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.getLead("LEAD/1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads/LEAD%2F1");
    expect(init?.method).toBeUndefined();
  });

  it("creates a lead with the required contact, solution, interest, status and owner", async () => {
    const data = {
      contactId: "CON-1",
      mainSolution: "RIVO",
      interest: "Alto" as const,
      status: "Novo" as const,
      ownerId: "USR-01",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "LEAD-1", ...data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createLead(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("updates lead details with PUT", async () => {
    const data = {
      contactId: "CON-1",
      mainSolution: "RIVO",
      interest: "Médio" as const,
      status: "Contactado" as const,
      ownerId: "USR-01",
      need: "Integração de sistemas",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "LEAD-1", ...data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.updateLead("LEAD-1", data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads/LEAD-1");
    expect(init?.method).toBe("PUT");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("deletes a lead by its ID", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await brainService.deleteLead("LEAD-1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads/LEAD-1");
    expect(init?.method).toBe("DELETE");
  });

  it("updates lead status with PATCH", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "LEAD-1", status: "Contactado" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.updateLeadStatus("LEAD-1", "Contactado");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads/LEAD-1/status");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({ status: "Contactado" });
  });

  it("lists interactions through the global endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "INT-1",
            leadId: "LEAD-1",
            type: "Nota",
            description: "Primeiro contacto",
            date: "2026-10-06T12:00:00Z",
            userId: "USR-01",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(brainService.getInteractions()).resolves.toMatchObject([
      { id: "INT-1", leadId: "LEAD-1" },
    ]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/interactions");
    expect(init?.method).toBeUndefined();
  });

  it("creates a global interaction with the required leadId, type and description", async () => {
    const data = { leadId: "LEAD-1", type: "Nota" as const, description: "Primeiro contacto" };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "INT-1", ...data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createInteraction(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/interactions");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("creates an interaction through the lead-specific endpoint", async () => {
    const data = { type: "WhatsApp" as const, description: "Apresentação enviada" };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "INT-2", leadId: "LEAD-2", ...data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createInteractionForLead("LEAD-2", data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/leads/LEAD-2/interactions");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("loads follow-ups through the dedicated remote endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "FUP-1",
            leadId: "LEAD-1",
            action: "Ligar",
            dueDate: "2026-10-07T10:00:00Z",
            ownerId: "USR-01",
            status: "Pendente",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(brainService.getFollowUps()).resolves.toMatchObject([
      { id: "FUP-1", leadId: "LEAD-1", status: "Pendente" },
    ]);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/follow-ups");
    expect(init?.method).toBeUndefined();
  });

  it("creates a follow-up with the fields required by the API", async () => {
    const data = {
      leadId: "LEAD-1",
      action: "Ligar" as const,
      dueDate: "2026-10-07T10:00:00Z",
    };
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "FUP-2", ...data, ownerId: "USR-01", status: "Pendente" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.createFollowUp(data);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/follow-ups");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(data);
  });

  it("updates a follow-up using the documented bodyless PUT", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "FUP-1", status: "Pendente" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.updateFollowUp("FUP-1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/follow-ups/FUP-1");
    expect(init?.method).toBe("PUT");
    expect(init?.body).toBeUndefined();
  });

  it("completes a follow-up with PATCH and no undocumented request body", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ id: "FUP-1", status: "Concluído" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await brainService.completeFollowUp("FUP-1");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain("/api/follow-ups/FUP-1/complete");
    expect(init?.method).toBe("PATCH");
    expect(init?.body).toBeUndefined();
  });
});
