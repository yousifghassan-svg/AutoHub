export { LicensePlate } from './components/LicensePlate';
export { licensePlateFromListing } from './lib/from-listing';
export {
  PlateEditor,
  DEFAULT_PLATE_FORM,
  plateFormToApiDetails,
  type PlateFormState,
} from './components/PlateEditor';
export {
  GOVERNORATES,
  PLATE_TYPE_LABELS,
  buildPlateDisplay,
  formatCodeFor,
  governorateFromFormatCode,
  normalizePlate,
} from './domain/governorates';
export {
  IRAQI_GOVERNORATES,
  PLATE_TYPES,
  isIraqiGovernorate,
  isPlateType,
  type IraqiGovernorate,
  type LicensePlateProps,
  type PlateType,
} from './domain/types';
export {
  generatePlateSvg,
  plateSvgDataUrl,
  PLATE_LAYOUT,
  PLATE_VIEWBOX,
} from './lib/generate-plate-svg';
export { exportPlatePng, exportPlatePdf } from './lib/export-plate';
export { clearSvgCache, svgCacheSize } from './lib/svg-cache';
