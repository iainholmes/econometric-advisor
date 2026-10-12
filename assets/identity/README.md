# IH. identity — source-derived transparent artwork

Canonical source: `desk/assets/identity/ih-master.png` in
`iainholmes/iainholmes.github.io`. It and the original crops are unchanged.
Master SHA-256: `7e2dabb7244b44c8a582792f59ff3cb1fa0eb8e911a8a4e7c249d68c5ba0c619`.

The interrupted remote work supplied transparent images and scoped identity
CSS. Inspection found pale edge fringes and inadequate green-on-navy contrast.
The final derivatives use the full original crop resolution, 466 × 438:

- `ih-signature.png`: original green lettering, transparent surround.
- `ih-signature-night.png`: source-derived ivory lettering for dark surfaces;
  identical alpha, proportions and copper illustration.
- `ih-period.png` (main repository only): 60 × 60 transparent copper circle.

The source-pixel matte removes neutral surrounding paper and unmattes fractional
edge coverage. Enclosed cream Rupert/pine details are protected, not color-keyed
away. Opaque green letter interiors preserve the source's colors and texture.
No letterforms are generated, traced, resampled or rearranged. The ivory
contrast treatment changes lettering colors only; its illustrated copper period
is identical to the green variant.

The reproducible builder is `scripts/build_identity_derivatives.cjs` in the main
repository and requires Node and ImageMagick. Its source inputs are immutable.
All three repositories use identical derivative files. Public references use
`?v=20261012-seamless2`; the old crops within `/desk/` are not edited.

Host typography, artwork, links and functionality remain unchanged. Signatures
retain their existing 40–44 CSS-pixel display widths. At those small sizes the
period is preserved but its detailed illustration is naturally tiny.

Supported browser control remains unavailable in this Work session. Asset
proofs were examined on ivory/navy and at 44/18px display sizes; those are not
integrated browser screenshots or physical acceptance.

The signature remains in its existing attribution/footer location. All original
application scripts and export-generation code remain byte-for-byte unchanged.
Only identity markup/styles, the image derivatives and these notes change.
