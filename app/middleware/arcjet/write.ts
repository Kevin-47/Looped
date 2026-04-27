import arcjet, { sensitiveInfo, slidingWindow } from "@/lib/arject";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { base } from "../base";
import { ArcjetNextRequest } from "@arcjet/next";

const buildStandardAj = () =>
  arcjet.withRule(
    slidingWindow({
        mode:'LIVE',
        interval: '1m',
        max: 40,
    })
  ).withRule(
        sensitiveInfo({
          mode: "LIVE",
          deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER"],
        })
      );
export const WriteSecurityMiddleware = base
  .$context<{
    request: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildStandardAj().protect(context.request, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "To many impactual changes. please slow down",
        });
      }
      if (decision.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "Senstive information detected. Pleasae remove PII (e.g, credit cards, phone numbers)",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request Blocked!",
      });
    }

    return next();
  });
