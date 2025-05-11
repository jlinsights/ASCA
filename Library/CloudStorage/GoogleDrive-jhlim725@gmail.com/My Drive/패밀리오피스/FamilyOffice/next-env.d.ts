/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild variant="primary" className="ml-2">
  <Link href="/contact">상담 신청</Link>
</Button>
