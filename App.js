import 'react-native-gesture-handler';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,  FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Gesture, GestureDetector, GestureHandlerRootView, } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const Stack = createNativeStackNavigator();

const STORE = '@QuackDev_candidatos';
const FREE_LIMIT = 3;

const initialCandidates = [
  {
    id: 'demo1',
    name: 'Ana Souza',
    age: '24',
    stacks: 'React Native, JavaScript',
    bio: 'Desenvolvedora mobile. Gosto de resolver problemas e aprender coisas novas.',
    salary: 'R$ 4.000 - R$ 5.500',
    analysis: 'Boa experiência com projetos mobile e trabalho em equipe.',
    photo: null,
    status: 'Pendente',
    priority: false,
  },
  {
    id: 'demo2',
    name: 'Lucas Martins',
    age: '27',
    stacks: 'Python, Django, SQL',
    bio: 'Desenvolvedor backend com experiência em APIs e bancos de dados.',
    salary: 'R$ 5.000 - R$ 6.500',
    analysis: 'Perfil com foco em backend e banco de dados.',
    photo: null,
    status: 'Pendente',
    priority: false,
  },
  {
    id: 'demo3',
    name: 'João Lima',
    age: '22',
    stacks: 'PHP, Laravel, MySQL',
    bio: 'Estou buscando uma oportunidade para crescer na área de tecnologia.',
    salary: 'R$ 3.000 - R$ 4.000',
    analysis: 'Perfil júnior, com conhecimentos em desenvolvimento web.',
    photo: null,
    status: 'Pendente',
    priority: false,
  },
];

const colors = {
  bg: '#1a2238',
  panel: '#28334e',
  panel2: '#202b43',
  yellow: '#ffd23f',
  white: '#f7f7f4',
  muted: '#b8c1d1',
  green: '#54b879',
  red: '#e45b62',
  line: '#414d65',
};

function Button({
  title,
  onPress,
  kind = 'yellow',
  small = false,
  disabled = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        small && styles.buttonSmall,
        kind === 'outline' && styles.buttonOutline,
        kind === 'green' && styles.buttonGreen,
        kind === 'red' && styles.buttonRed,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          kind === 'outline' && { color: colors.white },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8490a5"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && {
            minHeight: 84,
            textAlignVertical: 'top',
          },
        ]}
      />
    </View>
  );
}

function Avatar({ photo, name, size = 86 }) {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.panel2,
        }}
      />
    );
  }

  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { fontSize: size * 0.28 },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

function ProModal({ visible, onClose, onActivate }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalShade}>
        <View style={styles.modalBox}>
          <Text style={styles.eyebrow}>QuackDev</Text>
          <Text style={styles.modalTitle}>Plano PRO</Text>

          <Text style={styles.muted}>
            Mais controle na seleção de candidatos.
          </Text>

          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>
              Aprovações por sessão
            </Text>
            <Text style={styles.compareValue}>
              Free: 3 · PRO: sem limite
            </Text>
          </View>

          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>
              Desfazer swipe
            </Text>
            <Text style={styles.compareValue}>Só no PRO</Text>
          </View>

          <View style={styles.compareRow}>
            <Text style={styles.compareLabel}>
              Salário e análise
            </Text>
            <Text style={styles.compareValue}>Só no PRO</Text>
          </View>

          <Text style={[styles.muted, { marginTop: 12 }]}>
            Ativação apenas para demonstração. Não há cobrança.
          </Text>

          <Button
            title="Ativar PRO de demonstração"
            onPress={onActivate}
          />

          <Button
            title="Agora não"
            kind="outline"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

function DeckScreen({
  navigation,
  candidates,
  setCandidates,
  isPro,
  setIsPro,
  approvals,
  setApprovals,
  lastAction,
  setLastAction,
}) {
  const [index, setIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [proVisible, setProVisible] = useState(false);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const pending = useMemo(
    () => candidates.filter((c) => c.status === 'Pendente'),
    [candidates]
  );

  const candidate = pending.length
    ? pending[Math.min(index, pending.length - 1)]
    : null;

  useEffect(() => {
    if (index >= pending.length && pending.length) {
      setIndex(pending.length - 1);
    }
  }, [pending.length]);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
  }, [candidate?.id]);

  const moveCandidate = (direction) => {
    if (!candidate) return;

    const old = {
      id: candidate.id,
      status: candidate.status,
      priority: candidate.priority,
    };

    if (
      direction === 'approve' &&
      !isPro &&
      approvals >= FREE_LIMIT
    ) {
      setProVisible(true);
      return;
    }

    setLastAction(old);

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              status:
                direction === 'approve'
                  ? 'Aprovado'
                  : direction === 'reject'
                    ? 'Descartado'
                    : c.status,
            }
          : c
      )
    );

    if (direction === 'approve') {
      setApprovals((n) => n + 1);
    }

    setIndex(0);
    setDetailsVisible(false);

    translateX.value = withTiming(
      direction === 'approve' ? 500 : -500,
      { duration: 180 }
    );
  };

  const prioritize = () => {
    if (!candidate) return;

    setCandidates((prev) =>
      prev.map((c) => ({
        ...c,
        priority:
          c.id === candidate.id ? true : c.priority,
      }))
    );

    Alert.alert(
      'Prioridade marcada',
      `${candidate.name} foi colocado no topo da lista do gerente.`
    );
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        runOnJS(moveCandidate)('approve');
      } else if (e.translationX < -100) {
        runOnJS(moveCandidate)('reject');
      } else if (e.translationY < -90) {
        runOnJS(setDetailsVisible)(true);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(220)
    .onEnd(() => runOnJS(setDetailsVisible)(true));

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(260)
    .onEnd(() => runOnJS(prioritize)());

  const taps = Gesture.Exclusive(doubleTap, singleTap);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(2.5, e.scale));
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const combined = Gesture.Simultaneous(pan, taps, pinch);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 18}deg` },
    ],
  }));

  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activatePro = () => {
    setIsPro(true);
    setProVisible(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>
            QuackDev / SELEÇÃO
          </Text>
          <Text style={styles.screenTitle}>
            Deck de candidatos
          </Text>
        </View>

        <View style={styles.planPill}>
          <Text style={styles.planPillText}>
            {isPro ? 'PRO' : 'FREE'}
          </Text>
        </View>
      </View>

      <View style={styles.progressLine}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${
                candidates.length
                  ? ((candidates.length - pending.length) /
                      candidates.length) *
                    100
                  : 0
              }%`,
            },
          ]}
        />
      </View>

      <Text style={styles.muted}>
        {pending.length} perfil(is) aguardando avaliação
      </Text>

      {candidate ? (
        <GestureDetector gesture={combined}>
          <Animated.View
            style={[styles.profileCard, cardStyle]}
          >
            <View style={styles.photoArea}>
              <Animated.View style={photoStyle}>
                <Avatar
                  photo={candidate.photo}
                  name={candidate.name}
                  size={142}
                />
              </Animated.View>

              <View style={styles.photoHint}>
                <Text style={styles.photoHintText}>
                  PINÇA PARA ZOOM
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameLine}>
                <Text style={styles.candidateName}>
                  {candidate.name}
                </Text>
                <Text style={styles.age}>
                  {candidate.age} anos
                </Text>
              </View>

              {candidate.priority && (
                <Text style={styles.priorityText}>
                  ★ Prioridade
                </Text>
              )}

              <Text style={styles.stackLabel}>
                TECNOLOGIAS
              </Text>

              <View style={styles.tags}>
                {candidate.stacks
                  .split(',')
                  .map((s, i) => (
                    <Text key={i} style={styles.tag}>
                      {s.trim()}
                    </Text>
                  ))}
              </View>

              <Text
                style={styles.bioPreview}
                numberOfLines={3}
              >
                {candidate.bio ||
                  'Sem descrição cadastrada.'}
              </Text>

              <Text style={styles.hint}>
                Toque para ver mais · Dois toques para priorizar
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>
      ) : (
        <View
          style={[styles.profileCard, styles.emptyCard]}
        >
          <Text style={styles.emptyTitle}>
            Tudo por enquanto!
          </Text>

          <Text style={styles.muted}>
            Não há mais candidatos pendentes.
          </Text>

          <Button
            title="Cadastrar candidato"
            onPress={() =>
              navigation.navigate('Cadastro', {
                candidate: null,
              })
            }
          />
        </View>
      )}

      {candidate && (
        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.roundAction,
              { borderColor: colors.red },
            ]}
            onPress={() => moveCandidate('reject')}
          >
            <Text
              style={[
                styles.actionIcon,
                { color: colors.red },
              ]}
            >
              ×
            </Text>
            <Text style={styles.actionLabel}>
              Descartar
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roundAction,
              { borderColor: colors.yellow },
            ]}
            onPress={() => moveCandidate('approve')}
          >
            <Text
              style={[
                styles.actionIcon,
                { color: colors.yellow },
              ]}
            >
              ✓
            </Text>
            <Text style={styles.actionLabel}>
              Aprovar
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roundAction,
              { borderColor: colors.green },
            ]}
            onPress={prioritize}
          >
            <Text
              style={[
                styles.actionIcon,
                { color: colors.green },
              ]}
            >
              ★
            </Text>
            <Text style={styles.actionLabel}>
              Prioridade
            </Text>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomNav}>
        <Button
          title="Painel do gerente"
          onPress={() => navigation.navigate('Gerente')}
          kind="outline"
        />

        <Button
          title="＋ Candidato"
          onPress={() =>
            navigation.navigate('Cadastro', {
              candidate: null,
            })
          }
        />
      </View>

      <Text style={styles.quota}>
        {isPro
          ? 'PRO ativo: aprovações sem limite.'
          : `Free: ${Math.max(
              0,
              FREE_LIMIT - approvals
            )} de ${FREE_LIMIT} aprovações restantes nesta sessão.`}
      </Text>

      <Modal
        visible={detailsVisible && !!candidate}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.sheetShade}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setDetailsVisible(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>
              {candidate?.name}
            </Text>

            <Text style={styles.muted}>
              {candidate?.age} anos · {candidate?.stacks}
            </Text>

            <Text style={styles.sheetHeading}>Sobre</Text>

            <Text style={styles.bodyText}>
              {candidate?.bio ||
                'Sem descrição cadastrada.'}
            </Text>

            <Text style={styles.sheetHeading}>
              Pretensão salarial
            </Text>

            {isPro ? (
              <Text style={styles.bodyText}>
                {candidate?.salary || 'Não informada'}
              </Text>
            ) : (
              <Pressable
                onPress={() => {
                  setDetailsVisible(false);
                  setProVisible(true);
                }}
              >
                <View style={styles.lockedBox}>
                  <BlurView
                    intensity={65}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.lockText}>
                    🔒 Informação exclusiva do PRO
                  </Text>
                </View>
              </Pressable>
            )}

            <Text style={styles.sheetHeading}>
              Análise do perfil
            </Text>

            {isPro ? (
              <Text style={styles.bodyText}>
                {candidate?.analysis ||
                  'Ainda sem análise.'}
              </Text>
            ) : (
              <Pressable
                onPress={() => {
                  setDetailsVisible(false);
                  setProVisible(true);
                }}
              >
                <View style={styles.lockedBox}>
                  <BlurView
                    intensity={65}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.lockText}>
                    🔒 Toque para conhecer o PRO
                  </Text>
                </View>
              </Pressable>
            )}

            <Button
              title="Fechar"
              onPress={() => setDetailsVisible(false)}
              kind="outline"
            />
          </View>
        </View>
      </Modal>

      <ProModal
        visible={proVisible}
        onClose={() => setProVisible(false)}
        onActivate={activatePro}
      />
    </View>
  );
}

function ManagerScreen({
  navigation,
  candidates,
  setCandidates,
  isPro,
  onRevert,
  lastAction,
  onEdit,
}) {
  const sorted = [...candidates].sort(
    (a, b) => Number(b.priority) - Number(a.priority)
  );

  const badgeColor = (status) =>
    status === 'Aprovado'
      ? colors.green
      : status === 'Descartado'
        ? colors.red
        : colors.muted;

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>
            QuackDev / EQUIPE
          </Text>
          <Text style={styles.screenTitle}>
            Painel do gerente
          </Text>
        </View>

        <View style={styles.planPill}>
          <Text style={styles.planPillText}>
            {isPro ? 'PRO' : 'FREE'}
          </Text>
        </View>
      </View>

      <Text style={styles.muted}>
        Os candidatos marcados com ★ aparecem primeiro.
      </Text>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Nenhum candidato cadastrado.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.managerCard}>
            <Avatar
              photo={item.photo}
              name={item.name}
              size={54}
            />

            <View
              style={{ flex: 1, marginLeft: 12 }}
            >
              <Text style={styles.managerName}>
                {item.priority ? '★ ' : ''}
                {item.name}
              </Text>

              <Text style={styles.muted}>
                {item.age} anos · {item.stacks}
              </Text>

              <Text
                style={{
                  color: badgeColor(item.status),
                  marginTop: 4,
                  fontSize: 12,
                }}
              >
                {item.status}
              </Text>

              {isPro && (
                <Text style={styles.muted}>
                  Pretensão: {item.salary || 'Não informada'}
                </Text>
              )}

              <View style={styles.managerActions}>
                <Pressable onPress={() => onEdit(item)}>
                  <Text style={styles.linkText}>
                    Editar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Excluir candidato',
                      `Deseja excluir ${item.name}?`,
                      [
                        {
                          text: 'Cancelar',
                          style: 'cancel',
                        },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () =>
                            setCandidates((prev) =>
                              prev.filter(
                                (c) => c.id !== item.id
                              )
                            ),
                        },
                      ]
                    )
                  }
                >
                  <Text
                    style={[
                      styles.linkText,
                      { color: colors.red },
                    ]}
                  >
                    Excluir
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setCandidates((prev) =>
                      prev.map((c) => ({
                        ...c,
                        priority:
                          c.id === item.id
                            ? !c.priority
                            : c.priority,
                      }))
                    )
                  }
                >
                  <Text style={styles.linkText}>
                    {item.priority
                      ? 'Tirar prioridade'
                      : 'Priorizar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomNav}>
        <Button
          title="Voltar ao deck"
          onPress={() => navigation.navigate('Deck')}
          kind="outline"
        />

        <Button
          title="＋ Cadastrar"
          onPress={() =>
            navigation.navigate('Cadastro', {
              candidate: null,
            })
          }
        />
      </View>

      <Button
        title="↶ Desfazer último swipe (PRO)"
        kind="outline"
        onPress={onRevert}
      />
    </View>
  );
}

function FormScreen({
  navigation,
  route,
  candidates,
  setCandidates,
}) {
  const existing = route.params?.candidate;

  const [name, setName] = useState(existing?.name || '');
  const [age, setAge] = useState(existing?.age || '');
  const [stacks, setStacks] = useState(
    existing?.stacks || ''
  );
  const [bio, setBio] = useState(existing?.bio || '');
  const [salary, setSalary] = useState(
    existing?.salary || ''
  );
  const [analysis, setAnalysis] = useState(
    existing?.analysis || ''
  );
  const [photo, setPhoto] = useState(
    existing?.photo || null
  );

  const pickPhoto = async (camera) => {
    let permission;

    if (camera) {
      permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso à câmera nas configurações do aparelho.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.65,
        });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } else {
      permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso às fotos do aparelho.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.65,
        });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    }
  };

  const save = () => {
    if (!name.trim() || !age.trim() || !stacks.trim()) {
      Alert.alert(
        'Faltam dados',
        'Preencha nome, idade e tecnologias.'
      );
      return;
    }

    const candidate = {
      id: existing?.id || `${Date.now()}`,
      name: name.trim(),
      age: age.trim(),
      stacks: stacks.trim(),
      bio: bio.trim(),
      salary: salary.trim(),
      analysis: analysis.trim(),
      photo,
      status: existing?.status || 'Pendente',
      priority: existing?.priority || false,
    };

    if (existing) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === existing.id ? candidate : c
        )
      );
    } else {
      setCandidates((prev) => [...prev, candidate]);
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>
          CADASTRO DE CANDIDATO
        </Text>

        <Text style={styles.screenTitle}>
          {existing ? 'Editar perfil' : 'Novo perfil'}
        </Text>

        <View style={styles.photoPicker}>
          <Avatar
            photo={photo}
            name={name || 'Candidato'}
            size={94}
          />

          <View style={{ flex: 1, gap: 8 }}>
            <Button
              title="Tirar foto"
              onPress={() => pickPhoto(true)}
              small
            />

            <Button
              title="Escolher da galeria"
              onPress={() => pickPhoto(false)}
              kind="outline"
              small
            />
          </View>
        </View>

        <Field
          label="Nome completo *"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Ana Souza"
        />

        <Field
          label="Idade *"
          value={age}
          onChangeText={setAge}
          placeholder="Ex.: 24"
          keyboardType="number-pad"
        />

        <Field
          label="Linguagens e tecnologias *"
          value={stacks}
          onChangeText={setStacks}
          placeholder="React Native, Python, PHP..."
        />

        <Field
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Um pouco sobre a pessoa"
          multiline
        />

        <Text style={styles.formOptional}>
          Os dois campos abaixo são usados pelo recurso PRO.
        </Text>

        <Field
          label="Pretensão salarial"
          value={salary}
          onChangeText={setSalary}
          placeholder="Ex.: R$ 4.000 a R$ 5.000"
        />

        <Field
          label="Análise do perfil"
          value={analysis}
          onChangeText={setAnalysis}
          placeholder="Anotações para o gerente"
          multiline
        />

        <Button
          title={
            existing
              ? 'Salvar alterações'
              : 'Cadastrar candidato'
          }
          onPress={save}
        />

        <Button
          title="Cancelar"
          kind="outline"
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AppInner() {
  const [candidates, setCandidates] = useState(
    initialCandidates
  );
  const [loaded, setLoaded] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [approvals, setApprovals] = useState(0);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE);

        if (raw) {
          setCandidates(JSON.parse(raw));
        }

        const savedPro =
          await AsyncStorage.getItem('@QuackDev_pro');

        if (savedPro === 'true') {
          setIsPro(true);
        }
      } catch (e) {
        console.warn(
          'Não foi possível carregar os dados',
          e
        );
      }

      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(
        STORE,
        JSON.stringify(candidates)
      ).catch(() => {});
    }
  }, [candidates, loaded]);

  useEffect(() => {
    AsyncStorage.setItem(
      '@QuackDev_pro',
      String(isPro)
    ).catch(() => {});
  }, [isPro]);

  const revert = () => {
    if (!isPro) {
      Alert.alert(
        'Recurso PRO',
        'O desfazer swipe é exclusivo do plano PRO.'
      );
      return;
    }

    if (!lastAction) {
      Alert.alert(
        'Nada para desfazer',
        'Ainda não há um swipe recente para recuperar.'
      );
      return;
    }

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === lastAction.id
          ? {
              ...c,
              status: lastAction.status,
              priority: lastAction.priority,
            }
          : c
      )
    );

    setLastAction(null);
  };

  const editCandidate = (candidate) =>
    navigationRef.navigate('Editcandidate', { candidate });

  if (!loaded) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Deck">
          {(props) => (
            <DeckScreen
              {...props}
              candidates={candidates}
              setCandidates={setCandidates}
              isPro={isPro}
              setIsPro={setIsPro}
              approvals={approvals}
              setApprovals={setApprovals}
              lastAction={lastAction}
              setLastAction={setLastAction}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Gerente">
          {(props) => (
            <ManagerScreen
              {...props}
              candidates={candidates}
              setCandidates={setCandidates}
              isPro={isPro}
              onRevert={revert}
              lastAction={lastAction}
              onEdit={editCandidate}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Cadastro">
          {(props) => (
            <FormScreen
              {...props}
              candidates={candidates}
              setCandidates={setCandidates}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const navigationRef = React.createRef();

export default function App() {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
      }}
    >
      <StatusBar style="light" />
      <AppInner />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? 44 : 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  eyebrow: {
    color: colors.yellow,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 5,
  },

  screenTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '800',
  },

  planPill: {
    backgroundColor: colors.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  planPillText: {
    color: colors.bg,
    fontWeight: '900',
    fontSize: 12,
  },

  progressLine: {
    height: 4,
    backgroundColor: colors.panel,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: 4,
    backgroundColor: colors.yellow,
  },

  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  profileCard: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    maxHeight: 490,
  },

  photoArea: {
    height: '46%',
    minHeight: 180,
    backgroundColor: '#303e5a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  photoHint: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#1a2238bb',
  },

  photoHintText: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1,
  },

  profileInfo: {
    padding: 18,
  },

  nameLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },

  candidateName: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '800',
  },

  age: {
    color: colors.muted,
    fontSize: 14,
  },

  priorityText: {
    color: colors.yellow,
    fontSize: 12,
    marginTop: 4,
  },

  stackLabel: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 13,
    marginBottom: 6,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  tag: {
    color: colors.white,
    backgroundColor: '#3a4761',
    borderRadius: 5,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11,
  },

  bioPreview: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 19,
  },

  hint: {
    color: '#8996ad',
    fontSize: 10,
    marginTop: 12,
  },

  avatar: {
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.bg,
    fontWeight: '900',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  roundAction: {
    width: 78,
    height: 70,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },

  actionIcon: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 28,
  },

  actionLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },

  bottomNav: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },

  button: {
    backgroundColor: colors.yellow,
    borderRadius: 7,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    flex: 1,
  },

  buttonSmall: {
    paddingVertical: 8,
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },

  buttonGreen: {
    backgroundColor: colors.green,
  },

  buttonRed: {
    backgroundColor: colors.red,
  },

  buttonText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  quota: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },

  emptyCard: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },

  emptyTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '800',
  },

  sheetShade: {
    flex: 1,
    backgroundColor: '#0009',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
    paddingBottom: 28,
  },

  sheetHandle: {
    width: 42,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
  },

  sheetHeading: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 5,
  },

  bodyText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 21,
  },

  lockedBox: {
    minHeight: 46,
    backgroundColor: '#172035',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  lockText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    padding: 10,
  },

  modalShade: {
    flex: 1,
    backgroundColor: '#000b',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 22,
    width: '100%',
    maxWidth: 430,
    borderWidth: 1,
    borderColor: colors.line,
  },

  modalTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },

  compareRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 12,
  },

  compareLabel: {
    color: colors.muted,
    fontSize: 12,
  },

  compareValue: {
    color: colors.white,
    fontWeight: '700',
    marginTop: 3,
    fontSize: 13,
  },

  field: {
    marginTop: 14,
  },

  label: {
    color: colors.white,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '700',
  },

  input: {
    color: colors.white,
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },

  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.panel,
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },

  formOptional: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 20,
  },

  managerCard: {
    backgroundColor: colors.panel,
    borderRadius: 10,
    padding: 13,
    flexDirection: 'row',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },

  managerName: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },

  managerActions: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 10,
    flexWrap: 'wrap',
  },

  linkText: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '700',
  },
});