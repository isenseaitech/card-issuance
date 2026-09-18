// ---------------------------------------------------------------------------
// Shared React hook aliases
// ---------------------------------------------------------------------------
// Every file under js/ is a classic (non-module) script, so they all share one
// global scope. These aliases are declared exactly once, here, and used by the
// components in the other files. Re-declaring them elsewhere would throw
// "Identifier has already been declared".
const { useState, useMemo, useCallback, useEffect, useRef } = React;
