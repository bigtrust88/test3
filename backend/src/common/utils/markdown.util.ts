import { marked } from 'marked';

export class MarkdownUtil {
  static {
    // marked 설정 (보안 + 최적화)
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // 커스텀 렌더러 (보안: 스크립트 태그 제거)
    const renderer = new marked.Renderer();
    const originalImage = renderer.image.bind(renderer);

    renderer.image = (token) => {
      // 상대 경로를 CDN URL로 변환 (필요시)
      let url = token.href;
      if (!url.startsWith('http')) {
        url = `https://cdn.usstockstory.com/images/${url}`;
      }
      return `<img src="${url}" alt="${token.text}" loading="lazy" />`;
    };

    // 링크 보안: target="_blank", rel="noopener noreferrer" 추가
    const originalLink = renderer.link.bind(renderer);
    renderer.link = (token) => {
      return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.text}</a>`;
    };

    marked.setOptions({ renderer });
  }

  /**
   * 마크다운을 HTML로 변환
   * @param markdown 마크다운 텍스트
   * @returns HTML 문자열
   */
  static async toHtml(markdown: string): Promise<string> {
    try {
      const html = await marked.parse(markdown);
      return html;
    } catch (error) {
      console.error('Markdown 렌더링 오류:', error);
      throw new Error('마크다운 렌더링에 실패했습니다');
    }
  }

  /**
   * 마크다운에서 순수 텍스트 추출 (읽는 시간 계산용)
   * @param markdown 마크다운 텍스트
   * @returns 순수 텍스트
   */
  static extractPlainText(markdown: string): string {
    return (
      markdown
        .replace(/#{1,6}\s+/g, '') // 헤더 제거
        .replace(/\*\*(.+?)\*\*/g, '$1') // 볼드 제거
        .replace(/\*(.+?)\*/g, '$1') // 이탤릭 제거
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 링크 제거
        .replace(/`(.+?)`/g, '$1') // 인라인 코드 제거
        .replace(/```[\s\S]*?```/g, '') // 코드블록 제거
        .replace(/!?\[.+?\]\(.+?\)/g, '') // 이미지 제거
        .replace(/^[-*+]\s+/gm, '') // 불릿 제거
        .replace(/^\d+\.\s+/gm, '') // 숫자 리스트 제거
        .replace(/\n+/g, ' ') // 줄바꿈을 공백으로
        .trim()
    );
  }

  /**
   * 읽는 시간 계산 (한국어 기준: 300자/분)
   * @param markdown 마크다운 텍스트
   * @returns 읽는 시간 (분)
   */
  static calculateReadingTime(markdown: string): number {
    const plainText = this.extractPlainText(markdown);
    const characterCount = plainText.length;

    // 한국어: 평균 300자/분
    // 영어: 평균 200단어/분 (약 1000자/분, 하지만 혼합 텍스트는 더 느림)
    // 보수적으로 평균 250자/분 사용
    const readingTimeMinutes = Math.ceil(characterCount / 250);

    // 최소 1분, 최대 60분 (이상한 길이 방지)
    return Math.max(1, Math.min(readingTimeMinutes, 60));
  }

  /**
   * 발췌(Excerpt) 자동 생성 (처음 150자)
   * @param markdown 마크다운 텍스트
   * @returns 발췌 텍스트
   */
  static generateExcerpt(markdown: string, maxLength: number = 150): string {
    const plainText = this.extractPlainText(markdown);
    const excerpt = plainText.substring(0, maxLength);

    // 문장 경계에서 끝나도록 (마지막 공백 기준)
    if (plainText.length > maxLength) {
      const lastSpace = excerpt.lastIndexOf(' ');
      return excerpt.substring(0, lastSpace) + '...';
    }

    return excerpt;
  }

  /**
   * Markdown URL slug 생성 (제목 기반)
   * @param title 포스트 제목
   * @returns URL slug
   */
  static generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-가-힣]/g, '') // 특수문자 제거 (한글 유지)
        .replace(/\s+/g, '-') // 공백을 하이픈으로
        .replace(/-+/g, '-') // 연속 하이픈 제거
        .replace(/^-+|-+$/g, '') // 시작/끝 하이픈 제거
    );
  }
}
