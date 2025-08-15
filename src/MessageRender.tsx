'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, ZoomIn, Download } from 'lucide-react';
import 'katex/dist/katex.min.css';

// Type pour les props du code
interface CodeProps {
  inline?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface LatexMarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
  darkMode?: boolean;
}

const LatexMarkdownRenderer: React.FC<LatexMarkdownRendererProps> = ({ 
  content, 
  className = '',
  isUser = false,
  darkMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Améliorer le rendu des formules après le montage
    if (containerRef.current) {
      const mathElements = containerRef.current.querySelectorAll('.katex-display, .katex');
      mathElements.forEach(el => {
        el.setAttribute('style', 'font-size: 1.1em;');
      });
    }
  }, [content]);

  // Fonction pour copier du code
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Fonction pour basculer l'expansion d'image
  const toggleImageExpansion = (index: number) => {
    const newExpanded = new Set(expandedImages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedImages(newExpanded);
  };

  // Fonction pour échapper les caractères spéciaux dans LaTeX
  const escapeLatex = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\^/g, '\\^')
      .replace(/_/g, '\\_');
  };

  // Fonction pour détecter et traiter les formules LaTeX complexes
  const processLatexFormulas = (text: string): string => {
    // Détecter les formules LaTeX déjà bien formatées et les préserver
    return text
      // Gérer les formules complexes comme sqrt{(x_B - x_A)^{2} + (y_B - y_A)^{2}}
      .replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
        // Si c'est déjà dans un bloc math, ne pas modifier
        if (match.includes('$$')) return match;
        // Si c'est une formule complexe, la mettre en bloc
        if (content.includes('^{') || content.includes('_{') || content.includes('\\') || content.includes('+') || content.includes('-') || content.includes('_')) {
          return `\n$$$$\n${match}\n$$$$\n`;
        }
        return `$$${match}$$`;
      })
      // Préserver les fractions LaTeX
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match) => {
        if (match.includes('$$')) return match;
        return `$$${match}$$`;
      })
      // Préserver les vecteurs LaTeX
      .replace(/\\overrightarrow\{([^}]+)\}/g, (match) => {
        if (match.includes('$$')) return match;
        return `$$${match}$$`;
      })
      // Gérer les formules en blocs avec [ ]
      .replace(/\[([^[\]]+)\]/g, (match, content) => {
        // Si c'est une formule LaTeX, la convertir en bloc
        if (content.includes('\\') || content.includes('^{') || content.includes('_{') || content.includes('\\sqrt') || content.includes('\\boxed')) {
          return `\n$$$$\n${content}\n$$$$\n`;
        }
        return match;
      })
      // Gérer les formules avec boxed
      .replace(/\\boxed\{([^}]+)\}/g, (match, content) => {
        if (match.includes('$$')) return match;
        return `\n$$$$\n${match}\n$$$$\n`;
      })
      // Gérer les formules avec des exposants et indices complexes
      .replace(/([a-zA-Z])_([a-zA-Z])/g, '$1_{$2}')
      .replace(/([a-zA-Z])\^([a-zA-Z0-9])/g, '$1^{$2}')
      // Nettoyer les espaces dans les formules LaTeX
      .replace(/\$\$\s+/g, '$$')
      .replace(/\s+\$\$/g, '$$');
  };

  // Préprocesser le contenu pour améliorer la détection LaTeX et ajouter les graphiques
  const preprocessContent = (text: string): string => {
    let processed = text
      // Formules en ligne avec $ $ (amélioré pour éviter les conflits)
      .replace(/(?<!\\)\$([^$\n]+?)\$/g, '$$$1$$')
      // Formules en blocs avec $$ $$ (amélioré)
      .replace(/\$\$([^$]+?)\$\$/g, '\n$$$$\n$1\n$$$$\n')
      // Améliorer les vecteurs LaTeX courants
      .replace(/\\vec\{([^}]+)\}/g, '\\overrightarrow{$1}')
      // Gérer les fractions dans le texte (plus précis)
      .replace(/(?<!\\)(\d+)\/(\d+)(?!\d)/g, '\\frac{$1}{$2}')
      // Améliorer les exposants et indices (plus précis)
      .replace(/(?<!\\)\^(\d+)(?!\d)/g, '^{$1}')
      .replace(/(?<!\\)_(\d+)(?!\d)/g, '_{$1}')
      // Améliorer les racines carrées (plus robuste)
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      // Symboles mathématiques courants
      .replace(/\+-/g, '\\pm')
      .replace(/infinity/g, '\\infty')
      .replace(/alpha/g, '\\alpha')
      .replace(/beta/g, '\\beta')
      .replace(/gamma/g, '\\gamma')
      .replace(/delta/g, '\\delta')
      .replace(/theta/g, '\\theta')
      .replace(/lambda/g, '\\lambda')
      .replace(/pi/g, '\\pi')
      .replace(/sigma/g, '\\sigma')
      // Fonctions trigonométriques
      .replace(/sin\(/g, '\\sin(')
      .replace(/cos\(/g, '\\cos(')
      .replace(/tan\(/g, '\\tan(')
      .replace(/log\(/g, '\\log(')
      .replace(/ln\(/g, '\\ln(')
      // Gérer les formules LaTeX déjà correctement formatées
      .replace(/\\sqrt\{([^}]+)\}/g, '\\sqrt{$1}')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}')
      // Améliorer la détection des formules en blocs
      .replace(/\[([^[\]]+)\]/g, (match, content) => {
        // Si c'est une formule LaTeX, la convertir en bloc
        if (content.includes('\\') || content.includes('^{') || content.includes('_{') || content.includes('\\sqrt') || content.includes('\\boxed')) {
          return `\n$$$$\n${content}\n$$$$\n`;
        }
        return match;
      })
      // Gérer les formules avec des espaces et des caractères spéciaux
      .replace(/\\sqrt\s*\{([^}]+)\}/g, '\\sqrt{$1}')
      .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '\\frac{$1}{$2}')
      .replace(/\\overrightarrow\s*\{([^}]+)\}/g, '\\overrightarrow{$1}');

    return processed;
  };

  // Détecter et parser les graphiques simples
  const parseGraphData = (text: string) => {
    const graphMatches = text.match(/```graph\n([\s\S]*?)\n```/g);
    if (!graphMatches) return null;

    try {
      const graphData = graphMatches[0].replace(/```graph\n|\n```/g, '');
      return JSON.parse(graphData);
    } catch (e) {
      return null;
    }
  };

  const processedContent = processLatexFormulas(preprocessContent(content));
  const graphData = parseGraphData(content);

  // Variables de couleur basées sur le thème
  const textColors = {
    primary: isUser 
      ? (darkMode ? 'rgb(255, 255, 255)' : 'rgb(255, 255, 255)')
      : (darkMode ? 'rgb(248, 250, 252)' : 'rgb(15, 23, 42)'),
    secondary: isUser 
      ? (darkMode ? 'rgb(203, 213, 225)' : 'rgba(255, 255, 255, 0.8)')
      : (darkMode ? 'rgb(203, 213, 225)' : 'rgb(71, 85, 105)'),
    accent: darkMode ? 'rgb(99, 102, 241)' : 'rgb(99, 102, 241)',
    border: darkMode ? 'rgb(51, 65, 85)' : 'rgb(226, 232, 240)',
    background: darkMode ? 'rgb(30, 41, 59)' : 'rgb(248, 250, 252)',
    codeBackground: darkMode ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)'
  };

  return (
    <div 
      ref={containerRef}
      className={`enhanced-message-renderer max-w-none ${className}`}
      style={{
        lineHeight: '1.7',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: textColors.primary
      }}
    >
      {/* Graphique si présent */}
      {graphData && (
        <div className="mb-6 p-4 rounded-xl border" 
             style={{ backgroundColor: textColors.background, borderColor: textColors.border }}>
          <div className="text-center p-8">
            <p style={{ color: textColors.secondary }}>
              📊 Graphique détecté - Fonctionnalité en cours de développement
            </p>
            <pre className="mt-4 text-xs" style={{ color: textColors.secondary }}>
              {JSON.stringify(graphData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[
          rehypeKatex, 
          rehypeRaw,
          // Plugin personnalisé pour améliorer le rendu LaTeX
          () => (tree) => {
            // Améliorer le rendu des formules LaTeX
            return tree;
          }
        ]}
        components={{
          // Titres avec style adaptatif
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b-2"
                style={{ 
                  color: textColors.primary,
                  borderColor: textColors.accent
                }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 mt-5"
                style={{ color: textColors.primary }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 mt-4"
                style={{ color: textColors.primary }}>
              {children}
            </h3>
          ),
          
          // Paragraphes
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed"
               style={{ color: textColors.primary }}>
              {children}
            </p>
          ),
          
          // Mise en forme du texte
          strong: ({ children }) => (
            <strong className="font-semibold" style={{ color: textColors.primary }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic" style={{ color: textColors.secondary }}>
              {children}
            </em>
          ),
          
          // Listes
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 pl-4"
                style={{ color: textColors.primary }}>
              {children}
            </ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 pl-4"
                style={{ color: textColors.primary }}>
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed" style={{ color: textColors.primary }}>
              {children}
            </li>
          ),
          
          // Citations
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 pl-4 py-2 mb-4 italic rounded-r-lg"
                        style={{ 
                          borderColor: textColors.accent,
                          backgroundColor: textColors.background,
                          color: textColors.secondary
                        }}>
              {children}
            </blockquote>
          ),
          
          // Code avec fonctionnalité de copie
          code: ({ inline, children, className }: CodeProps) => {
            const codeString = String(children || '').replace(/\n$/, '');
            
            if (inline) {
              return (
                <code className="px-2 py-1 rounded text-sm font-mono"
                      style={{ 
                        backgroundColor: textColors.codeBackground,
                        color: textColors.accent,
                        border: `1px solid ${textColors.border}`
                      }}>
                  {children}
                </code>
              );
            }
            
            // For block code, use a span with block display to avoid hydration issues
            return (
              <span className="block relative group mb-4">
                <span className="block p-4 rounded-xl overflow-x-auto font-mono text-sm whitespace-pre-wrap"
                     style={{ 
                       backgroundColor: textColors.codeBackground,
                       border: `1px solid ${textColors.border}`
                     }}>
                  <code style={{ color: textColors.primary }}>
                    {children}
                  </code>
                </span>
                <button
                  onClick={() => copyToClipboard(codeString)}
                  className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: textColors.background,
                    color: textColors.secondary
                  }}
                >
                  {copiedCode === codeString ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </span>
            );
          },
          
          // Tableaux
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6 rounded-lg border"
                 style={{ borderColor: textColors.border }}>
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ backgroundColor: textColors.background }}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border px-4 py-3 text-left font-semibold"
                style={{ 
                  borderColor: textColors.border,
                  color: textColors.primary
                }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-4 py-3"
                style={{ 
                  borderColor: textColors.border,
                  color: textColors.primary
                }}>
              {children}
            </td>
          ),
          
          // Images avec zoom
          img: ({ src, alt, ...props }) => {
            const imgIndex = Math.random();
            const isExpanded = expandedImages.has(imgIndex);
            
            return (
              <div className="relative group my-4">
                <img
                  src={src}
                  alt={alt}
                  className={`rounded-lg transition-all cursor-pointer ${
                    isExpanded ? 'fixed inset-4 z-50 max-w-none max-h-none object-contain' : 'max-w-full h-auto'
                  }`}
                  onClick={() => toggleImageExpansion(imgIndex)}
                  style={{ backgroundColor: textColors.background }}
                  {...props}
                />
                {!isExpanded && (
                  <button
                    onClick={() => toggleImageExpansion(imgIndex)}
                    className="absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white'
                    }}
                  >
                    <ZoomIn size={16} />
                  </button>
                )}
                {isExpanded && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-40"
                    onClick={() => toggleImageExpansion(imgIndex)}
                  />
                )}
              </div>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
      
      <style jsx global>{`
        .enhanced-message-renderer .katex {
          font-size: 1.15em !important;
          color: ${textColors.primary} !important;
          line-height: 1.2 !important;
        }
        
        .enhanced-message-renderer .katex-display {
          margin: 1.5em 0 !important;
          text-align: center;
          padding: 1em;
          background: ${textColors.background};
          border-radius: 12px;
          border: 1px solid ${textColors.border};
          overflow-x: auto;
          overflow-y: hidden;
        }
        
        .enhanced-message-renderer .katex-display > .katex {
          display: inline-block;
          text-align: initial;
          color: ${textColors.primary} !important;
          white-space: nowrap;
        }
        
        .enhanced-message-renderer .katex-display > .katex {
          display: inline-block;
          text-align: initial;
          color: ${textColors.primary} !important;
        }
        
        .enhanced-message-renderer .katex .base {
          color: ${textColors.primary} !important;
        }
        
        .enhanced-message-renderer math {
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
        }
        
        .enhanced-message-renderer .math-inline {
          display: inline;
          padding: 0.2em 0.4em;
          background: ${textColors.background};
          border-radius: 6px;
          border: 1px solid ${textColors.border};
        }
        
        .enhanced-message-renderer .math-display {
          display: block;
          margin: 1.5em 0;
          text-align: center;
        }
        
        /* Améliorer le scrollbar des équations */
        .enhanced-message-renderer math::-webkit-scrollbar {
          height: 4px;
        }
        
        .enhanced-message-renderer math::-webkit-scrollbar-track {
          background: ${textColors.background};
        }
        
        .enhanced-message-renderer math::-webkit-scrollbar-thumb {
          background: ${textColors.border};
          border-radius: 2px;
        }
        
        /* Animation pour les nouvelles équations */
        .enhanced-message-renderer .katex-display {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Améliorer les fractions et les matrices */
        .enhanced-message-renderer .katex .frac-line {
          border-bottom-color: ${textColors.primary} !important;
        }
        
        .enhanced-message-renderer .katex .arraycolsep {
          color: ${textColors.primary} !important;
        }
        
        /* Style pour les graphiques */
        .enhanced-message-renderer .plotly {
          border-radius: 12px;
          overflow: hidden;
        }
        
        /* Responsive pour les équations */
        @media (max-width: 640px) {
          .enhanced-message-renderer .katex-display {
            font-size: 0.9em !important;
            padding: 0.8em;
            margin: 1em 0;
          }
          
          .enhanced-message-renderer .katex {
            font-size: 1em !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LatexMarkdownRenderer;