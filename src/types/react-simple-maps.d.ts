declare module "react-simple-maps" {
  import { ComponentType, ReactNode, CSSProperties, MouseEvent } from "react";

  interface ProjectionConfig {
    rotate?: [number, number, number];
    center?: [number, number];
    scale?: number;
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (event: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (event: { coordinates: [number, number]; zoom: number }) => void;
    children?: ReactNode;
  }

  interface GeographyStyleProps {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeoProperties {
    ISO_A3?: string;
    ISO_A2?: string;
    name?: string;
    [key: string]: unknown;
  }

  interface GeoFeature {
    rsmKey: string;
    properties: GeoProperties;
    type: string;
    geometry: unknown;
  }

  interface GeographyProps {
    geography: GeoFeature;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: GeographyStyleProps;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseMove?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
    className?: string;
  }

  interface GeographiesChildrenProps {
    geographies: GeoFeature[];
    outline: unknown;
    borders: unknown;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (data: GeographiesChildrenProps) => ReactNode;
    parseGeographies?: (features: unknown[]) => unknown[];
    className?: string;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    style?: GeographyStyleProps;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Annotation: ComponentType<unknown>;
  export const Graticule: ComponentType<unknown>;
  export const Line: ComponentType<unknown>;
  export const Sphere: ComponentType<unknown>;
}
