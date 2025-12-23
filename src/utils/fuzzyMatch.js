/**
 * Fuzzy matching utilities for auto-grading answers
 */

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove punctuation
 * - Normalize whitespace
 */
export function normalize(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the number of single-character edits needed to transform a into b
 */
export function levenshtein(a, b) {
    if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Check if an answer is close enough to be auto-approved
 * @param {string} answer - The submitted answer
 * @param {string} correct - The correct answer
 * @param {number} threshold - Maximum allowed edits (default: 3)
 * @returns {{ isMatch: boolean, distance: number, autoApproved: boolean }}
 */
export function fuzzyMatch(answer, correct, threshold = 3) {
    const normalizedAnswer = normalize(answer);
    const normalizedCorrect = normalize(correct);

    // Exact match
    if (normalizedAnswer === normalizedCorrect) {
        return { isMatch: true, distance: 0, autoApproved: true };
    }

    // Calculate edit distance
    const distance = levenshtein(normalizedAnswer, normalizedCorrect);

    return {
        isMatch: distance <= threshold,
        distance,
        autoApproved: distance <= threshold
    };
}
