import { useState, type ChangeEvent, type FormEvent } from "react";
import { DarkPatternDialog } from "../components/DarkPatternDialog";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface FormValues {
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
}

type FieldName = "name" | "email" | "message";
type FormErrors = Partial<Record<FieldName, string>>;

// La casilla de novedades nace marcada: parte del dark pattern del envío.
const EMPTY_FORM: FormValues = { name: "", email: "", message: "", newsletter: true };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUBSCRIBE_KEY = "orbita:recordar-suscripcion:v1";

function readSubscribePreference(): boolean {
  try {
    return window.localStorage.getItem(SUBSCRIBE_KEY) === "1";
  } catch {
    return false;
  }
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Escribe tu nombre (mínimo 2 caracteres).";
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Ingresa un email válido, por ejemplo nombre@dominio.com.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Cuéntanos un poco más (mínimo 10 caracteres).";
  }

  return errors;
}

export function ContactPage() {
  useDocumentTitle("Contacto");
  const toast = useToast();

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [skipNextSubscription, setSkipNextSubscription] = useState(readSubscribePreference);
  const [declineOpen, setDeclineOpen] = useState(false);

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(field: FieldName) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));
    };
  }

  function handleNewsletterChange(event: ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target;

    if (checked) {
      setValues((previous) => ({ ...previous, newsletter: true }));
      return;
    }

    // Desmarcarla no basta: otro diálogo intenta retener la suscripción (nagging).
    setDeclineOpen(true);
  }

  function handleBlur(field: FieldName) {
    return () => setTouched((previous) => ({ ...previous, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });

    if (!isValid) {
      toast.error("Revisa el formulario", "Hay campos con errores antes de enviar.");
      return;
    }

    if (!values.newsletter) {
      send(false);
      return;
    }

    if (skipNextSubscription) {
      // Preferencia recordada desde el diálogo: se suscribe sin preguntar.
      send(true);
      return;
    }

    setConfirmOpen(true);
  }

  function handleConfirmSend(rememberChoice: boolean) {
    setConfirmOpen(false);

    if (rememberChoice) {
      try {
        window.localStorage.setItem(SUBSCRIBE_KEY, "1");
      } catch {
        // Sin almacenamiento disponible, la preferencia vive solo en memoria.
      }
      setSkipNextSubscription(true);
    }

    send(true);
  }

  function handleDeclineSubscription() {
    setConfirmOpen(false);
    send(false);
  }

  function send(subscribed: boolean) {
    setSending(true);

    // Simulamos el envío para mostrar el estado y el toast.
    window.setTimeout(() => {
      setSending(false);
      setValues(EMPTY_FORM);
      setTouched({});
      toast.success(
        "Mensaje enviado",
        subscribed
          ? "Gracias por escribirnos. También te sumamos a las novedades del archivo."
          : "Gracias por escribirnos. Te responderemos a la brevedad.",
      );
    }, 700);
  }

  const showError = (field: FieldName) => Boolean(touched[field] && errors[field]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <header>
        <p className="eyebrow">Contacto</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-star sm:text-4xl">
          Escríbenos
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-haze">
          ¿Viste algo raro en el archivo? ¿Falta una misión? Déjanos un mensaje y lo revisamos.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form
          noValidate
          onSubmit={handleSubmit}
          aria-labelledby="form-titulo"
          className="rounded-2xl border border-line/80 bg-panel/50 p-5 sm:p-6"
        >
          <h2 id="form-titulo" className="sr-only">
            Formulario de contacto
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-star">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={values.name}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                autoComplete="name"
                aria-required="true"
                aria-invalid={showError("name")}
                aria-describedby={showError("name") ? "nombre-error" : undefined}
                placeholder="Cómo te llamas"
                className={`field ${showError("name") ? "field-error" : ""}`}
              />
              {showError("name") ? (
                <p id="nombre-error" role="alert" className="mt-1.5 text-xs text-rose-300">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-star">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                autoComplete="email"
                inputMode="email"
                aria-required="true"
                aria-invalid={showError("email")}
                aria-describedby={showError("email") ? "email-error" : "email-ayuda"}
                placeholder="nombre@dominio.com"
                className={`field ${showError("email") ? "field-error" : ""}`}
              />
              {showError("email") ? (
                <p id="email-error" role="alert" className="mt-1.5 text-xs text-rose-300">
                  {errors.email}
                </p>
              ) : (
                <p id="email-ayuda" className="mt-1.5 text-xs text-haze">
                  Nunca compartimos tu dirección.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-star">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={5}
                value={values.message}
                onChange={handleChange("message")}
                onBlur={handleBlur("message")}
                aria-required="true"
                aria-invalid={showError("message")}
                aria-describedby={showError("message") ? "mensaje-error" : "mensaje-ayuda"}
                placeholder="Escribe tu mensaje…"
                className={`field resize-y ${showError("message") ? "field-error" : ""}`}
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                {showError("message") ? (
                  <p id="mensaje-error" role="alert" className="text-xs text-rose-300">
                    {errors.message}
                  </p>
                ) : (
                  <p id="mensaje-ayuda" className="text-xs text-haze/70">
                    Mínimo 10 caracteres.
                  </p>
                )}
                <span className="shrink-0 text-xs text-haze/80" aria-hidden="true">
                  {values.message.trim().length} caracteres
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5">
            <input
              id="newsletter"
              name="newsletter"
              type="checkbox"
              checked={values.newsletter}
              onChange={handleNewsletterChange}
              className="mt-0.5 size-4 shrink-0 accent-flare"
            />
            <div>
              <label htmlFor="newsletter" className="text-sm font-medium text-star">
                Quiero recibir novedades del archivo
              </label>
              <p className="text-xs text-haze">Un correo ocasional con lo mejor del archivo.</p>
            </div>
          </div>

          <div className="mt-6 border-t border-line/60 pt-5">
            <button type="submit" disabled={!isValid || sending} className="btn-primary w-full sm:w-auto">
              {sending ? "Enviando…" : "Enviar mensaje"}
            </button>

            <p id="envio-ayuda" className="mt-2 text-xs text-haze">
              {isValid
                ? "Todo listo: al enviar te pedimos una confirmación."
                : "Completa los tres campos para habilitar el envío."}
            </p>
          </div>
        </form>

        <aside aria-label="Información del proyecto" className="space-y-4">
          <div className="rounded-2xl border border-line/80 bg-panel/50 p-5">
            <h2 className="font-display text-base font-semibold text-star">Sobre los datos</h2>
            <p className="mt-2 text-sm leading-relaxed text-haze">
              Todo lo que ves viene de la API pública de imágenes de la NASA, sin claves ni copias
              locales.
            </p>
            <a
              href="https://images-api.nasa.gov"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block text-sm text-flare underline decoration-flare/40 underline-offset-4 hover:decoration-flare"
            >
              images-api.nasa.gov ↗
            </a>
          </div>

          <div className="rounded-2xl border border-line/80 bg-panel/50 p-5">
            <h2 className="font-display text-base font-semibold text-star">Qué puedes reportar</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-haze">
              <li>Imágenes que no cargan o créditos faltantes.</li>
              <li>Búsquedas que no devuelven lo esperado.</li>
              <li>Ideas de filtros o misiones para sumar.</li>
            </ul>
          </div>
        </aside>
      </div>

      <DarkPatternDialog
        open={confirmOpen}
        title="¿Enviar y suscribirte?"
        description={
          values.name.trim()
            ? `Vamos a registrar el mensaje de ${values.name.trim()} (${values.email.trim()}) y a sumarte a las novedades del archivo.`
            : "Vamos a registrar tu mensaje y a sumarte a las novedades del archivo."
        }
        confirmLabel="Sí, enviar y suscribirme"
        declineLabel="No, prefiero perderme las novedades"
        rememberLabel="No volver a preguntar"
        rememberHint="(recomendado: la próxima vez te suscribimos sin preguntar)"
        closeLabel="Cerrar sin enviar"
        onConfirm={handleConfirmSend}
        onDecline={handleDeclineSubscription}
        onCancel={() => setConfirmOpen(false)}
      />

      <DarkPatternDialog
        open={declineOpen}
        title="¿Prefieres perderte las novedades?"
        description="Un correo ocasional con lo mejor del archivo. Puedes darte de baja cuando quieras."
        confirmLabel="Sí, quiero recibirlas"
        declineLabel="No, prefiero perderme las novedades"
        closeLabel="Cerrar y mantener la suscripción"
        tone="default"
        showRemember={false}
        onConfirm={() => setDeclineOpen(false)}
        onDecline={() => {
          setValues((previous) => ({ ...previous, newsletter: false }));
          setDeclineOpen(false);
        }}
        onCancel={() => setDeclineOpen(false)}
      />
    </div>
  );
}
