\version "2.20.0"
\include "articulate.ly"
\paper {
  indent = 0\mm
  short-indent = 0\mm
  
    page-breaking = #ly:one-line-breaking
  
  left-margin = 4\mm
  right-margin = 4\mm
  top-margin = 4\mm
  bottom-margin = 4\mm
  oddHeaderMarkup = ##f
  evenHeaderMarkup = ##f
  oddFooterMarkup = ##f
  evenFooterMarkup = ##f
}
\score {
  {
  a b c d e
  }
  \layout { 
    #(layout-set-staff-size 16)
    \context {
      \Lyrics
      
      
    }
  }
  \midi { 
    \tempo 4 = 120
  }
}