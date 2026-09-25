import { formatUsdcAmount } from "@/helpers/format.helper";
import { truncateStellarAddress } from "@/helpers/stellar.helper";

export type PayrollShareKind = "salary" | "test";

export type PayrollShareReceiver = {
  readonly name: string;
  readonly wallet: string;
  readonly amount: number;
};

export type PayrollShareImageInput = {
  readonly periodLabel: string;
  readonly totalAmount: number;
  readonly memberCount: number;
  readonly contractId: string;
  readonly engagementId: string;
  readonly kind: PayrollShareKind;
  readonly receivers: readonly PayrollShareReceiver[];
};

type SharePalette = {
  background: string;
  card: string;
  foreground: string;
  muted: string;
  border: string;
  primary: string;
  primaryForeground: string;
};

const LOGO_SRC = "/icon.png";
const USDC_ICON_SRC = "/usdc.webp";

function readCssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function resolveSharePalette(): SharePalette {
  return {
    background: readCssColor("--background", "#0a0a0a"),
    card: readCssColor("--card", "#1a1a1a"),
    foreground: readCssColor("--foreground", "#fafafa"),
    muted: readCssColor("--muted-foreground", "#a1a1a1"),
    border: readCssColor("--border", "#2a2a2a"),
    primary: readCssColor("--primary-500", "#006be4"),
    primaryForeground: readCssColor("--primary-foreground", "#ffffff"),
  };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

async function loadImageOrNull(src: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
): void {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawAmountWithUsdcIcon(
  ctx: CanvasRenderingContext2D,
  amount: number,
  x: number,
  baselineY: number,
  options: {
    font: string;
    fillStyle: string;
    icon: HTMLImageElement | null;
    iconSize: number;
    gap?: number;
  },
): void {
  const gap = options.gap ?? 14;
  let textX = x;

  if (options.icon) {
    const iconTop = baselineY - options.iconSize * 0.82;
    ctx.drawImage(
      options.icon,
      x,
      iconTop,
      options.iconSize,
      options.iconSize,
    );
    textX = x + options.iconSize + gap;
  }

  ctx.fillStyle = options.fillStyle;
  ctx.font = options.font;
  ctx.fillText(formatUsdcAmount(amount), textX, baselineY);
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let drawn = text;
  while (drawn.length > 3 && ctx.measureText(`${drawn}…`).width > maxWidth) {
    drawn = drawn.slice(0, -1);
  }
  return `${drawn}…`;
}

export async function buildPayrollShareImage(
  input: PayrollShareImageInput,
): Promise<Blob> {
  const width = 1080;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create share image.");
  }

  const palette = resolveSharePalette();
  const pad = 64;
  const contentX = pad + 48;
  const contentRight = width - pad - 48;
  const contentWidth = contentRight - contentX;

  const [logo, usdcIcon] = await Promise.all([
    loadImageOrNull(LOGO_SRC),
    loadImageOrNull(USDC_ICON_SRC),
  ]);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 48);
  ctx.fillStyle = palette.card;
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  let y = pad + 56;

  if (logo) {
    const logoMax = 72;
    drawContainedImage(
      ctx,
      logo,
      contentRight - logoMax,
      y - 8,
      logoMax,
      logoMax,
    );
  }

  ctx.fillStyle = palette.muted;
  ctx.font = "500 26px system-ui, sans-serif";
  const eyebrow =
    input.kind === "test"
      ? "Trustless Work · Test payments"
      : "Trustless Work · Payroll";
  ctx.fillText(eyebrow, contentX, y + 28);
  y += 72;

  ctx.fillStyle = palette.foreground;
  const title = input.periodLabel;
  let titleFontSize = 48;
  ctx.font = `600 ${titleFontSize}px system-ui, sans-serif`;
  while (
    ctx.measureText(title).width > contentWidth - 16 &&
    titleFontSize > 32
  ) {
    titleFontSize -= 2;
    ctx.font = `600 ${titleFontSize}px system-ui, sans-serif`;
  }
  ctx.fillText(title, contentX, y);
  y += 56;

  const badgeLabel = "Paid";
  ctx.font = "600 24px system-ui, sans-serif";
  const badgeWidth = ctx.measureText(badgeLabel).width + 44;
  const badgeHeight = 44;
  roundRect(ctx, contentX, y, badgeWidth, badgeHeight, 999);
  ctx.fillStyle = palette.primary;
  ctx.fill();
  ctx.fillStyle = palette.primaryForeground;
  ctx.fillText(badgeLabel, contentX + 22, y + 30);
  y += 96;

  ctx.fillStyle = palette.muted;
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.fillText("Total released", contentX, y);
  y += 72;

  drawAmountWithUsdcIcon(ctx, input.totalAmount, contentX, y, {
    font: "700 68px system-ui, sans-serif",
    fillStyle: palette.foreground,
    icon: usdcIcon,
    iconSize: 56,
    gap: 16,
  });
  y += 72;

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentX, y);
  ctx.lineTo(contentRight, y);
  ctx.stroke();
  y += 52;

  const details: Array<{ label: string; value: string }> = [
    { label: "Team members", value: String(input.memberCount) },
    {
      label: "Contract",
      value: truncateStellarAddress(input.contractId, 8, 6),
    },
  ];

  for (const detail of details) {
    ctx.fillStyle = palette.muted;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText(detail.label, contentX, y);
    ctx.fillStyle = palette.foreground;
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText(detail.value, contentX + 260, y);
    y += 48;
  }

  if (input.receivers.length > 0) {
    y += 36;
    ctx.fillStyle = palette.muted;
    ctx.font = "500 22px system-ui, sans-serif";
    ctx.fillText("Receivers", contentX, y);
    y += 48;

    const columnGap = 40;
    const columnWidth = (contentWidth - columnGap) / 2;
    const rowHeight = 128;

    input.receivers.forEach((receiver, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const cellX = contentX + column * (columnWidth + columnGap);
      const cellY = y + row * rowHeight;

      ctx.fillStyle = palette.foreground;
      ctx.font = "600 24px system-ui, sans-serif";
      ctx.fillText(fitText(ctx, receiver.name, columnWidth), cellX, cellY);

      drawAmountWithUsdcIcon(ctx, receiver.amount, cellX, cellY + 42, {
        font: "600 22px system-ui, sans-serif",
        fillStyle: palette.foreground,
        icon: usdcIcon,
        iconSize: 24,
        gap: 10,
      });

      ctx.fillStyle = palette.muted;
      ctx.font = "500 20px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(
        truncateStellarAddress(receiver.wallet, 6, 4),
        cellX,
        cellY + 84,
      );
    });

    const receiverRows = Math.ceil(input.receivers.length / 2);
    y += receiverRows * rowHeight + 8;
  }

  y = Math.max(y + 24, height - pad - 56);
  ctx.fillStyle = palette.muted;
  ctx.font = "500 20px system-ui, sans-serif";
  const footer =
    input.kind === "test"
      ? "Test payments completed · trustlesswork.com"
      : "Salary payroll completed · trustlesswork.com";
  ctx.fillText(footer, contentX, y);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export share image."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export function buildPayrollShareCaption(input: PayrollShareImageInput): string {
  const headline =
    input.kind === "test"
      ? "Trustless Work test payments paid ✅"
      : "Trustless Work payroll paid ✅";

  return [
    headline,
    input.periodLabel,
    `${formatUsdcAmount(input.totalAmount)} · ${input.memberCount} members`,
  ].join("\n");
}
